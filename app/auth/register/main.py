from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta, timezone
import uuid,os, bcrypt,sqlite3,jwt

# Server initialization
app = FastAPI()

# --- Constants ---
SECRET_KEY = "your-super-secret-key-change-me"  # Later implement environment variables
ALGORITHM = "HS256"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, '..', 'data', 'database.db')

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allows frontend to connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database initialization
def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            pk INTEGER PRIMARY KEY AUTOINCREMENT,
            id TEXT NOT NULL UNIQUE,
            firstName TEXT,
            lastName TEXT,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            companyName TEXT
        )
    ''')

    # Tasks table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            pk INTEGER PRIMARY KEY AUTOINCREMENT,
            id TEXT NOT NULL UNIQUE,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL,
            priority INTEGER NOT NULL,
            estimate_hours REAL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    # Dependencies table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS dependencies (
            pk INTEGER PRIMARY KEY AUTOINCREMENT,
            id TEXT NOT NULL UNIQUE,
            task_id TEXT NOT NULL,
            depends_on_id TEXT NOT NULL,
            type TEXT NOT NULL,
            FOREIGN KEY (task_id) REFERENCES tasks(id),
            FOREIGN KEY (depends_on_id) REFERENCES tasks(id)
        )
    ''')

    # Personas table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS personas (
            pk INTEGER PRIMARY KEY AUTOINCREMENT,
            id TEXT NOT NULL UNIQUE,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            weekly_capacity_hours REAL NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    # Task-Persona assignments table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS task_persona_assignments (
            pk INTEGER PRIMARY KEY AUTOINCREMENT,
            id TEXT NOT NULL UNIQUE,
            task_id TEXT NOT NULL,
            persona_id TEXT NOT NULL,
            FOREIGN KEY (task_id) REFERENCES tasks(id),
            FOREIGN KEY (persona_id) REFERENCES personas(id)
        )
    ''')

    conn.commit()
    conn.close()

init_db()


# Classes with pydantic
class Task(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    status: str = Field(..., pattern="^(todo|in_progress|blocked|done)$")
    priority: int = Field(ge=1, le=5)
    estimate_hours: Optional[float] = Field(gt=0)
    assignee_id: Optional[str]
    dependencies: List[str] = []
    created_at: datetime

class Dependency(BaseModel):
    task_id: str
    depends_on_id: str
    type: str = Field(..., pattern="^(blocks|relates_to)$")

class Persona(BaseModel):
    id: str
    name: str
    weekly_capacity_hours: float = Field(gt=0)
    current_load_hours: float = Field(ge=0)

    @property
    def utilization(self) -> float:
        return self.current_load_hours / self.weekly_capacity_hours

class EnvoySuggestion(BaseModel):
    task_id: str
    suggestion_type: str
    confidence: float = Field(ge=0, le=1)
    message: str

class UserCreate(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    password: str
    companyName: Optional[str] = None
    rememberMe: bool = False

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    rememberMe: bool = False


# Endpoints
@app.get('/')
async def root():
    return {"status":'ok',"message": "TaskLinex API is active"}

@app.post('/signup')
async def signup(user: UserCreate):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE email = ?', (user.email,))
    existing_user = cursor.fetchone()

    if existing_user:
        conn.close()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered.")
    
    hashed_pass = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    user_id = str(uuid.uuid4())
    
    cursor.execute(
        'INSERT INTO users (id, firstName, lastName, email, password, companyName) VALUES (?, ?, ?, ?, ?, ?)', 
        (user_id, user.firstName, user.lastName, user.email, hashed_pass.decode('utf-8'), user.companyName)
    )
    conn.commit()
    conn.close()

    return {"message": "User created successfully"}

@app.post('/login')
async def login(form_data: UserLogin):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT password, id FROM users WHERE email = ?", (form_data.email,))
    result = cursor.fetchone()
    conn.close()

    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    stored_hash_str = result[0]
    user_id = result[1]
    
    input_password_bytes = form_data.password.encode('utf-8')
    stored_hash_bytes = stored_hash_str.encode('utf-8')

    if not bcrypt.checkpw(input_password_bytes, stored_hash_bytes):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_span = timedelta(days=15) if form_data.rememberMe else timedelta(minutes=30)
    expire = datetime.now(timezone.utc) + token_span
    payload = {'sub': form_data.email, 'id': user_id, 'exp': expire}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    
    return {"access_token": token, "token_type": "bearer"}

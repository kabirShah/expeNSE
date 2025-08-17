from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timedelta
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    amount: float
    description: str
    category: str
    platform: str  # gpay, phonepe, hdfc, icici, etc
    transaction_type: str  # debit, credit
    date: datetime
    merchant: Optional[str] = None
    reference_id: Optional[str] = None
    balance_after: Optional[float] = None

class TransactionCreate(BaseModel):
    amount: float
    description: str
    category: str
    platform: str
    transaction_type: str
    merchant: Optional[str] = None

class ExpenseSummary(BaseModel):
    total_spent: float
    total_income: float
    net_balance: float
    transaction_count: int
    top_category: str
    platform_breakdown: Dict[str, float]

class PlatformIntegration(BaseModel):
    platform_id: str
    platform_name: str
    is_connected: bool
    last_sync: Optional[datetime] = None
    account_balance: Optional[float] = None
    transaction_count: int = 0

# Mock data generation for different platforms
def generate_mock_transactions():
    platforms = [
        {"name": "GPay", "id": "gpay"},
        {"name": "PhonePe", "id": "phonepe"}, 
        {"name": "HDFC Bank", "id": "hdfc"},
        {"name": "ICICI Bank", "id": "icici"},
        {"name": "Apple Pay", "id": "applepay"},
        {"name": "Paytm", "id": "paytm"}
    ]
    
    categories = [
        "Food & Dining", "Shopping", "Transportation", "Bills & Utilities",
        "Entertainment", "Healthcare", "Groceries", "Travel", "Education", "Other"
    ]
    
    merchants = [
        "Zomato", "Swiggy", "Amazon", "Flipkart", "Uber", "Ola", 
        "Big Bazaar", "DMart", "PVR Cinemas", "Starbucks", 
        "McDonald's", "Domino's", "BookMyShow", "Netflix"
    ]
    
    transactions = []
    current_date = datetime.now()
    
    for platform in platforms:
        # Generate 15-30 transactions per platform for last 30 days
        num_transactions = random.randint(15, 30)
        
        for _ in range(num_transactions):
            transaction_date = current_date - timedelta(days=random.randint(0, 30))
            transaction_type = random.choice(["debit", "credit"]) if random.random() > 0.8 else "debit"
            
            amount = random.uniform(50, 5000) if transaction_type == "debit" else random.uniform(100, 10000)
            
            transaction = Transaction(
                amount=round(amount, 2),
                description=f"Payment via {platform['name']}",
                category=random.choice(categories),
                platform=platform["id"],
                transaction_type=transaction_type,
                date=transaction_date,
                merchant=random.choice(merchants),
                reference_id=f"TXN{random.randint(100000, 999999)}",
                balance_after=random.uniform(1000, 50000)
            )
            transactions.append(transaction)
    
    return transactions

# Initialize mock data
mock_transactions = generate_mock_transactions()

@api_router.get("/")
async def root():
    return {"message": "Expense Tracker API"}

@api_router.get("/transactions", response_model=List[Transaction])
async def get_transactions(
    platform: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 50
):
    """Get transactions with optional filtering"""
    filtered_transactions = mock_transactions
    
    if platform:
        filtered_transactions = [t for t in filtered_transactions if t.platform == platform]
    
    if category:
        filtered_transactions = [t for t in filtered_transactions if t.category == category]
    
    # Sort by date descending and limit
    filtered_transactions.sort(key=lambda x: x.date, reverse=True)
    return filtered_transactions[:limit]

@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(transaction_data: TransactionCreate):
    """Create a new transaction"""
    transaction = Transaction(
        **transaction_data.dict(),
        date=datetime.now()
    )
    mock_transactions.append(transaction)
    return transaction

@api_router.get("/summary", response_model=ExpenseSummary)
async def get_expense_summary(days: int = 30):
    """Get expense summary for specified days"""
    cutoff_date = datetime.now() - timedelta(days=days)
    recent_transactions = [t for t in mock_transactions if t.date >= cutoff_date]
    
    total_spent = sum(t.amount for t in recent_transactions if t.transaction_type == "debit")
    total_income = sum(t.amount for t in recent_transactions if t.transaction_type == "credit")
    
    # Category breakdown
    category_spending = {}
    for t in recent_transactions:
        if t.transaction_type == "debit":
            category_spending[t.category] = category_spending.get(t.category, 0) + t.amount
    
    top_category = max(category_spending.items(), key=lambda x: x[1])[0] if category_spending else "None"
    
    # Platform breakdown
    platform_breakdown = {}
    for t in recent_transactions:
        if t.transaction_type == "debit":
            platform_breakdown[t.platform] = platform_breakdown.get(t.platform, 0) + t.amount
    
    return ExpenseSummary(
        total_spent=round(total_spent, 2),
        total_income=round(total_income, 2),
        net_balance=round(total_income - total_spent, 2),
        transaction_count=len(recent_transactions),
        top_category=top_category,
        platform_breakdown=platform_breakdown
    )

@api_router.get("/integrations", response_model=List[PlatformIntegration])
async def get_platform_integrations():
    """Get status of all platform integrations"""
    platforms = [
        PlatformIntegration(
            platform_id="gpay",
            platform_name="Google Pay",
            is_connected=True,
            last_sync=datetime.now() - timedelta(minutes=30),
            account_balance=15420.50,
            transaction_count=len([t for t in mock_transactions if t.platform == "gpay"])
        ),
        PlatformIntegration(
            platform_id="phonepe",
            platform_name="PhonePe",
            is_connected=True,
            last_sync=datetime.now() - timedelta(hours=2),
            account_balance=8750.25,
            transaction_count=len([t for t in mock_transactions if t.platform == "phonepe"])
        ),
        PlatformIntegration(
            platform_id="hdfc",
            platform_name="HDFC Bank",
            is_connected=True,
            last_sync=datetime.now() - timedelta(hours=1),
            account_balance=45230.75,
            transaction_count=len([t for t in mock_transactions if t.platform == "hdfc"])
        ),
        PlatformIntegration(
            platform_id="icici",
            platform_name="ICICI Bank",
            is_connected=True,
            last_sync=datetime.now() - timedelta(hours=3),
            account_balance=32840.90,
            transaction_count=len([t for t in mock_transactions if t.platform == "icici"])
        ),
        PlatformIntegration(
            platform_id="applepay",
            platform_name="Apple Pay",
            is_connected=False,
            last_sync=None,
            account_balance=None,
            transaction_count=0
        ),
        PlatformIntegration(
            platform_id="paytm",
            platform_name="Paytm",
            is_connected=True,
            last_sync=datetime.now() - timedelta(minutes=45),
            account_balance=2340.80,
            transaction_count=len([t for t in mock_transactions if t.platform == "paytm"])
        )
    ]
    return platforms

@api_router.get("/analytics/monthly")
async def get_monthly_analytics():
    """Get monthly expense analytics"""
    current_date = datetime.now()
    monthly_data = []
    
    for i in range(6):  # Last 6 months
        month_start = current_date.replace(day=1) - timedelta(days=i*30)
        month_end = month_start + timedelta(days=30)
        
        month_transactions = [
            t for t in mock_transactions 
            if month_start <= t.date <= month_end and t.transaction_type == "debit"
        ]
        
        total_spent = sum(t.amount for t in month_transactions)
        
        monthly_data.append({
            "month": month_start.strftime("%B %Y"),
            "total_spent": round(total_spent, 2),
            "transaction_count": len(month_transactions)
        })
    
    return {"monthly_data": monthly_data[::-1]}  # Reverse to show oldest first

@api_router.get("/analytics/categories")
async def get_category_analytics(days: int = 30):
    """Get category-wise expense analytics"""
    cutoff_date = datetime.now() - timedelta(days=days)
    recent_transactions = [
        t for t in mock_transactions 
        if t.date >= cutoff_date and t.transaction_type == "debit"
    ]
    
    category_data = {}
    for transaction in recent_transactions:
        category = transaction.category
        if category not in category_data:
            category_data[category] = {
                "total_amount": 0,
                "transaction_count": 0,
                "percentage": 0
            }
        
        category_data[category]["total_amount"] += transaction.amount
        category_data[category]["transaction_count"] += 1
    
    total_spending = sum(data["total_amount"] for data in category_data.values())
    
    for category, data in category_data.items():
        data["total_amount"] = round(data["total_amount"], 2)
        data["percentage"] = round((data["total_amount"] / total_spending) * 100, 1) if total_spending > 0 else 0
    
    return {"category_data": category_data}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
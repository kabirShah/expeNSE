#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Expense Tracking App
Tests all API endpoints with proper validation and error handling
"""

import requests
import json
from datetime import datetime
import sys
import os

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except FileNotFoundError:
        return "http://localhost:8001"
    return "http://localhost:8001"

BASE_URL = get_backend_url() + "/api"
print(f"Testing backend API at: {BASE_URL}")

class ExpenseTrackerAPITest:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name, success, message="", data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "data": data
        })
        
    def test_basic_connectivity(self):
        """Test GET /api/ endpoint for basic connectivity"""
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_test("Basic Connectivity", True, f"API responding: {data['message']}")
                    return True
                else:
                    self.log_test("Basic Connectivity", False, "Response missing 'message' field")
                    return False
            else:
                self.log_test("Basic Connectivity", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Basic Connectivity", False, f"Connection error: {str(e)}")
            return False
    
    def test_expense_summary(self):
        """Test GET /api/summary endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/summary")
            if response.status_code == 200:
                data = response.json()
                required_fields = ["total_spent", "total_income", "net_balance", "transaction_count", "top_category", "platform_breakdown"]
                
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    self.log_test("Expense Summary", False, f"Missing fields: {missing_fields}")
                    return False
                
                # Validate data types and values
                if not isinstance(data["total_spent"], (int, float)) or data["total_spent"] < 0:
                    self.log_test("Expense Summary", False, "Invalid total_spent value")
                    return False
                    
                if not isinstance(data["total_income"], (int, float)) or data["total_income"] < 0:
                    self.log_test("Expense Summary", False, "Invalid total_income value")
                    return False
                    
                if not isinstance(data["transaction_count"], int) or data["transaction_count"] < 0:
                    self.log_test("Expense Summary", False, "Invalid transaction_count value")
                    return False
                
                if not isinstance(data["platform_breakdown"], dict):
                    self.log_test("Expense Summary", False, "platform_breakdown should be a dictionary")
                    return False
                
                # Check if platform breakdown has expected platforms
                expected_platforms = ["gpay", "phonepe", "hdfc", "icici", "paytm"]
                found_platforms = [p for p in expected_platforms if p in data["platform_breakdown"]]
                
                self.log_test("Expense Summary", True, 
                    f"Summary: ₹{data['total_spent']:.2f} spent, ₹{data['total_income']:.2f} income, "
                    f"{data['transaction_count']} transactions, Top: {data['top_category']}, "
                    f"Platforms: {len(found_platforms)}/{len(expected_platforms)}")
                return True
            else:
                self.log_test("Expense Summary", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Expense Summary", False, f"Error: {str(e)}")
            return False
    
    def test_transactions_endpoint(self):
        """Test GET /api/transactions endpoint with filtering"""
        try:
            # Test basic transactions endpoint
            response = self.session.get(f"{self.base_url}/transactions")
            if response.status_code != 200:
                self.log_test("Transactions Basic", False, f"HTTP {response.status_code}: {response.text}")
                return False
            
            transactions = response.json()
            if not isinstance(transactions, list):
                self.log_test("Transactions Basic", False, "Response should be a list")
                return False
            
            if len(transactions) == 0:
                self.log_test("Transactions Basic", False, "No transactions found")
                return False
            
            # Validate transaction structure
            sample_transaction = transactions[0]
            required_fields = ["id", "amount", "description", "category", "platform", "transaction_type", "date"]
            missing_fields = [field for field in required_fields if field not in sample_transaction]
            
            if missing_fields:
                self.log_test("Transactions Basic", False, f"Transaction missing fields: {missing_fields}")
                return False
            
            self.log_test("Transactions Basic", True, f"Retrieved {len(transactions)} transactions")
            
            # Test platform filtering
            test_platforms = ["gpay", "phonepe", "hdfc", "icici", "paytm"]
            platform_results = {}
            
            for platform in test_platforms:
                response = self.session.get(f"{self.base_url}/transactions?platform={platform}")
                if response.status_code == 200:
                    platform_transactions = response.json()
                    platform_results[platform] = len(platform_transactions)
                    
                    # Verify all transactions are from the requested platform
                    if platform_transactions:
                        wrong_platform = [t for t in platform_transactions if t.get("platform") != platform]
                        if wrong_platform:
                            self.log_test("Platform Filtering", False, f"Found {len(wrong_platform)} transactions with wrong platform for {platform}")
                            return False
                else:
                    self.log_test("Platform Filtering", False, f"Failed to filter by platform {platform}")
                    return False
            
            self.log_test("Platform Filtering", True, f"Platform counts: {platform_results}")
            
            # Test category filtering
            response = self.session.get(f"{self.base_url}/transactions?category=Food & Dining")
            if response.status_code == 200:
                food_transactions = response.json()
                if food_transactions:
                    wrong_category = [t for t in food_transactions if t.get("category") != "Food & Dining"]
                    if wrong_category:
                        self.log_test("Category Filtering", False, f"Found {len(wrong_category)} transactions with wrong category")
                        return False
                    self.log_test("Category Filtering", True, f"Found {len(food_transactions)} Food & Dining transactions")
                else:
                    self.log_test("Category Filtering", True, "No Food & Dining transactions found (acceptable)")
            else:
                self.log_test("Category Filtering", False, "Failed to filter by category")
                return False
            
            return True
            
        except Exception as e:
            self.log_test("Transactions Endpoint", False, f"Error: {str(e)}")
            return False
    
    def test_create_transaction(self):
        """Test POST /api/transactions endpoint"""
        try:
            new_transaction = {
                "amount": 250.75,
                "description": "Test transaction via API",
                "category": "Food & Dining",
                "platform": "gpay",
                "transaction_type": "debit",
                "merchant": "Test Restaurant"
            }
            
            response = self.session.post(f"{self.base_url}/transactions", json=new_transaction)
            if response.status_code == 200:
                created_transaction = response.json()
                
                # Verify the created transaction has all required fields
                required_fields = ["id", "amount", "description", "category", "platform", "transaction_type", "date"]
                missing_fields = [field for field in required_fields if field not in created_transaction]
                
                if missing_fields:
                    self.log_test("Create Transaction", False, f"Created transaction missing fields: {missing_fields}")
                    return False
                
                # Verify the data matches what we sent
                for field in ["amount", "description", "category", "platform", "transaction_type", "merchant"]:
                    if created_transaction.get(field) != new_transaction.get(field):
                        self.log_test("Create Transaction", False, f"Field {field} mismatch: expected {new_transaction.get(field)}, got {created_transaction.get(field)}")
                        return False
                
                self.log_test("Create Transaction", True, f"Created transaction with ID: {created_transaction['id']}")
                return True
            else:
                self.log_test("Create Transaction", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Transaction", False, f"Error: {str(e)}")
            return False
    
    def test_platform_integrations(self):
        """Test GET /api/integrations endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/integrations")
            if response.status_code == 200:
                integrations = response.json()
                
                if not isinstance(integrations, list):
                    self.log_test("Platform Integrations", False, "Response should be a list")
                    return False
                
                expected_platforms = ["gpay", "phonepe", "hdfc", "icici", "applepay", "paytm"]
                found_platforms = []
                
                for integration in integrations:
                    required_fields = ["platform_id", "platform_name", "is_connected", "transaction_count"]
                    missing_fields = [field for field in required_fields if field not in integration]
                    
                    if missing_fields:
                        self.log_test("Platform Integrations", False, f"Integration missing fields: {missing_fields}")
                        return False
                    
                    found_platforms.append(integration["platform_id"])
                    
                    # Validate data types
                    if not isinstance(integration["is_connected"], bool):
                        self.log_test("Platform Integrations", False, f"is_connected should be boolean for {integration['platform_id']}")
                        return False
                    
                    if not isinstance(integration["transaction_count"], int) or integration["transaction_count"] < 0:
                        self.log_test("Platform Integrations", False, f"Invalid transaction_count for {integration['platform_id']}")
                        return False
                
                missing_platforms = [p for p in expected_platforms if p not in found_platforms]
                if missing_platforms:
                    self.log_test("Platform Integrations", False, f"Missing platforms: {missing_platforms}")
                    return False
                
                connected_count = sum(1 for i in integrations if i["is_connected"])
                self.log_test("Platform Integrations", True, 
                    f"Found all {len(expected_platforms)} platforms, {connected_count} connected")
                return True
            else:
                self.log_test("Platform Integrations", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Platform Integrations", False, f"Error: {str(e)}")
            return False
    
    def test_monthly_analytics(self):
        """Test GET /api/analytics/monthly endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/analytics/monthly")
            if response.status_code == 200:
                data = response.json()
                
                if "monthly_data" not in data:
                    self.log_test("Monthly Analytics", False, "Response missing 'monthly_data' field")
                    return False
                
                monthly_data = data["monthly_data"]
                if not isinstance(monthly_data, list):
                    self.log_test("Monthly Analytics", False, "monthly_data should be a list")
                    return False
                
                if len(monthly_data) == 0:
                    self.log_test("Monthly Analytics", False, "No monthly data found")
                    return False
                
                # Validate monthly data structure
                for month_data in monthly_data:
                    required_fields = ["month", "total_spent", "transaction_count"]
                    missing_fields = [field for field in required_fields if field not in month_data]
                    
                    if missing_fields:
                        self.log_test("Monthly Analytics", False, f"Monthly data missing fields: {missing_fields}")
                        return False
                    
                    if not isinstance(month_data["total_spent"], (int, float)) or month_data["total_spent"] < 0:
                        self.log_test("Monthly Analytics", False, f"Invalid total_spent for {month_data['month']}")
                        return False
                    
                    if not isinstance(month_data["transaction_count"], int) or month_data["transaction_count"] < 0:
                        self.log_test("Monthly Analytics", False, f"Invalid transaction_count for {month_data['month']}")
                        return False
                
                self.log_test("Monthly Analytics", True, f"Retrieved {len(monthly_data)} months of data")
                return True
            else:
                self.log_test("Monthly Analytics", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Monthly Analytics", False, f"Error: {str(e)}")
            return False
    
    def test_category_analytics(self):
        """Test GET /api/analytics/categories endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/analytics/categories")
            if response.status_code == 200:
                data = response.json()
                
                if "category_data" not in data:
                    self.log_test("Category Analytics", False, "Response missing 'category_data' field")
                    return False
                
                category_data = data["category_data"]
                if not isinstance(category_data, dict):
                    self.log_test("Category Analytics", False, "category_data should be a dictionary")
                    return False
                
                if len(category_data) == 0:
                    self.log_test("Category Analytics", False, "No category data found")
                    return False
                
                total_percentage = 0
                for category, cat_data in category_data.items():
                    required_fields = ["total_amount", "transaction_count", "percentage"]
                    missing_fields = [field for field in required_fields if field not in cat_data]
                    
                    if missing_fields:
                        self.log_test("Category Analytics", False, f"Category {category} missing fields: {missing_fields}")
                        return False
                    
                    if not isinstance(cat_data["total_amount"], (int, float)) or cat_data["total_amount"] < 0:
                        self.log_test("Category Analytics", False, f"Invalid total_amount for {category}")
                        return False
                    
                    if not isinstance(cat_data["transaction_count"], int) or cat_data["transaction_count"] < 0:
                        self.log_test("Category Analytics", False, f"Invalid transaction_count for {category}")
                        return False
                    
                    if not isinstance(cat_data["percentage"], (int, float)) or cat_data["percentage"] < 0 or cat_data["percentage"] > 100:
                        self.log_test("Category Analytics", False, f"Invalid percentage for {category}: {cat_data['percentage']}")
                        return False
                    
                    total_percentage += cat_data["percentage"]
                
                # Allow small rounding errors in percentage calculation
                if abs(total_percentage - 100.0) > 0.5:
                    self.log_test("Category Analytics", False, f"Percentages don't add up to 100%: {total_percentage}")
                    return False
                
                self.log_test("Category Analytics", True, f"Retrieved {len(category_data)} categories with proper percentages")
                return True
            else:
                self.log_test("Category Analytics", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Category Analytics", False, f"Error: {str(e)}")
            return False
    
    def test_error_handling(self):
        """Test error handling with invalid requests"""
        try:
            # Test invalid platform filter
            response = self.session.get(f"{self.base_url}/transactions?platform=invalid_platform")
            if response.status_code == 200:
                transactions = response.json()
                if len(transactions) == 0:
                    self.log_test("Error Handling - Invalid Platform", True, "Correctly returned empty list for invalid platform")
                else:
                    self.log_test("Error Handling - Invalid Platform", False, "Should return empty list for invalid platform")
                    return False
            else:
                self.log_test("Error Handling - Invalid Platform", False, f"Unexpected status code: {response.status_code}")
                return False
            
            # Test invalid endpoint
            response = self.session.get(f"{self.base_url}/nonexistent")
            if response.status_code == 404:
                self.log_test("Error Handling - Invalid Endpoint", True, "Correctly returned 404 for invalid endpoint")
            else:
                self.log_test("Error Handling - Invalid Endpoint", False, f"Expected 404, got {response.status_code}")
                return False
            
            return True
        except Exception as e:
            self.log_test("Error Handling", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all tests and return summary"""
        print("=" * 60)
        print("EXPENSE TRACKER BACKEND API TESTING")
        print("=" * 60)
        
        tests = [
            self.test_basic_connectivity,
            self.test_expense_summary,
            self.test_transactions_endpoint,
            self.test_create_transaction,
            self.test_platform_integrations,
            self.test_monthly_analytics,
            self.test_category_analytics,
            self.test_error_handling
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ FAIL {test.__name__}: Unexpected error: {str(e)}")
                failed += 1
            print("-" * 40)
        
        print("=" * 60)
        print(f"TEST SUMMARY: {passed} PASSED, {failed} FAILED")
        print("=" * 60)
        
        return passed, failed, self.test_results

if __name__ == "__main__":
    tester = ExpenseTrackerAPITest()
    passed, failed, results = tester.run_all_tests()
    
    if failed > 0:
        print(f"\n❌ {failed} tests failed. Backend needs attention.")
        sys.exit(1)
    else:
        print(f"\n✅ All {passed} tests passed! Backend is working correctly.")
        sys.exit(0)
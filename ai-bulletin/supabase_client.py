import os
from dotenv import load_dotenv
from supabase import create_client

# Load variables from .env.local
load_dotenv(".env.local")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
# Use the SERVICE_ROLE_KEY to bypass Row-Level Security (RLS) when running backend scripts
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[Error] Missing Supabase environment variables.")
    print("Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
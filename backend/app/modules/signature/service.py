# Database operations (create_user, get_user_by_email)

from app.core.supabase import supabase

def get_documents():
    return supabase.table("documents").select("*").execute()
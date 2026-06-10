# Token, TokenPayload Pydantic models
from pydantic import BaseModel, EmailStr , Field 

class RegisterSchema(BaseModel):
    full_name: str = Field(...,ge=2 , le=20)
    email:EmailStr
    password: str


class LoginSchema(BaseModel):
    email:EmailStr
    password:str


class TokenResponse(BaseModel):
    access_token:str
    token_type:str = "bearer"
    refresh_token :str

class RefreshToken(BaseModel):
    refresh_token:str
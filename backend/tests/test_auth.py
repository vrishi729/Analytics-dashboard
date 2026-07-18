import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    resp = await client.post(
        '/api/v1/auth/register',
        json={'email': 'new@example.com', 'password': 'strongpass123'},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert 'access_token' in data
    assert 'refresh_token' in data
    assert data['token_type'] == 'bearer'


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    await client.post(
        '/api/v1/auth/register',
        json={'email': 'dup@example.com', 'password': 'strongpass123'},
    )
    resp = await client.post(
        '/api/v1/auth/register',
        json={'email': 'dup@example.com', 'password': 'otherpass456'},
    )
    assert resp.status_code == 409
    assert 'already registered' in resp.json()['detail']


@pytest.mark.asyncio
async def test_register_weak_password(client: AsyncClient):
    resp = await client.post(
        '/api/v1/auth/register',
        json={'email': 'weak@example.com', 'password': 'short'},
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    await client.post(
        '/api/v1/auth/register',
        json={'email': 'login@example.com', 'password': 'strongpass123'},
    )
    resp = await client.post(
        '/api/v1/auth/login',
        json={'email': 'login@example.com', 'password': 'strongpass123'},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert 'access_token' in data
    assert 'refresh_token' in data


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    resp = await client.post(
        '/api/v1/auth/login',
        json={'email': 'nonexistent@example.com', 'password': 'wrongpass123'},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient):
    reg = await client.post(
        '/api/v1/auth/register',
        json={'email': 'refresh@example.com', 'password': 'strongpass123'},
    )
    refresh_token = reg.json()['refresh_token']

    resp = await client.post(
        '/api/v1/auth/refresh',
        json={'refresh_token': refresh_token},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert 'access_token' in data
    assert 'refresh_token' in data


@pytest.mark.asyncio
async def test_get_me(client: AsyncClient, auth_headers: dict[str, str]):
    resp = await client.get('/api/v1/auth/me', headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data['email'] == 'test@example.com'
    assert 'id' in data


@pytest.mark.asyncio
async def test_get_me_unauthorized(client: AsyncClient):
    resp = await client.get('/api/v1/auth/me')
    assert resp.status_code == 401

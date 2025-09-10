import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders without crashing', async () => {
    render(<App />)
    // kiểm tra có heading "Login"
    expect(await screen.findByRole('heading', { name: /login/i })).toBeInTheDocument()
  })
})

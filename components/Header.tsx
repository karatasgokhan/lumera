export default function Header() {
  return (
    <header style={{ 
      padding: '1rem 2rem', 
      borderBottom: '1px solid #e0e0e0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Lumera</h1>
      <nav>
        <a href="/" style={{ marginRight: '1rem' }}>Ana Sayfa</a>
        <a href="/products" style={{ marginRight: '1rem' }}>Ürünler</a>
        <a href="/cart">Sepet</a>
      </nav>
    </header>
  )
}


export default function Footer() {
    return (
        <footer style={{ background: 'white', borderTop: '1px solid #e5e7eb', marginTop: 'auto' }}>
            <div className="footer-inner">
                <span style={{ color: '#c0392b', fontWeight: 700, fontSize: 16 }}>Pokédex</span>
                <span className="footer-copy" style={{ color: '#9ca3af', fontSize: 13 }}>© 2026 Pokédex Database</span>
            </div>
        </footer>
    );
}
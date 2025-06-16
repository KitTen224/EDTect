'use client';

export default function Home() {
    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '40px',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🎌 Japan Travel Planner</h1>
                <p style={{ fontSize: '20px', marginBottom: '40px' }}>
                    AI-Powered Japan Travel Planning
                </p>
                
                <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '30px',
                    borderRadius: '15px',
                    marginBottom: '40px'
                }}>
                    <h2>Welcome to EDTect Japan Travel!</h2>
                    <p>Create your perfect Japan itinerary with AI assistance.</p>
                </div>
            </div>

            {/* Simple Chat Button */}
            <div
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    zIndex: 999999,
                    backgroundColor: '#dc2626',
                    color: 'white',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px',
                    cursor: 'pointer',
                    border: '4px solid white',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
                    transition: 'all 0.3s ease'
                }}
                onClick={() => {
                    alert('🤖 Chat AI Button Works!\n\nThis will open the chat interface.');
                    console.log('🤖 Chat AI button clicked!');
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.backgroundColor = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.backgroundColor = '#dc2626';
                }}
                title="AIチャットを開く"
            >
                💬
            </div>

            {/* Test Button Top Right */}
            <div
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    backgroundColor: '#059669',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    zIndex: 999999,
                    border: '2px solid white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
                onClick={() => alert('Debug: Top right button works!')}
            >
                DEBUG
            </div>
        </div>
    );
}

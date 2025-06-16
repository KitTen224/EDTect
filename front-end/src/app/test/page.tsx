'use client';

export default function TestPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#f0f0f0', padding: 40 }}>
            <h1>🧪 SIMPLE NEXT.JS TEST</h1>
            <button
                style={{
                    background: 'blue',
                    color: 'white',
                    fontSize: 24,
                    padding: '20px 40px',
                    borderRadius: 12,
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: 40
                }}
                onClick={() => alert('Nút React hoạt động!')}
            >
                TEST BUTTON
            </button>

            {/* Chat AI Button - Fixed Position */}
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
                    boxShadow: '0 8px 25px rgba(0,0,0,0.5)'
                }}
                onClick={() => alert('🤖 Chat AI Button Clicked!')}
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
                    padding: '15px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    zIndex: 999999,
                    border: '2px solid white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
                onClick={() => alert('Top Right Button Works!')}
            >
                TOP RIGHT
            </div>
        </div>
    );
}

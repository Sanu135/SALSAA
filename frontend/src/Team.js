import React from 'react';

function Team() {
  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="sec-header" style={{ marginTop: '60px', textAlign: 'center' }}>
        <div className="sec-title" style={{ fontSize: '2em', fontWeight: 'bold' }}><span>TEAM</span> & CREDITS</div>
        <div className="sec-desc" style={{ color: '#888', marginTop: '10px' }}></div>
      </div>

      <div className="team-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginTop: '40px' }}>
        {/* Developer 1 */}
        <div className="team-card" style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', width: '300px', textAlign: 'center' }}>
          
          <div className="team-info" style={{ marginTop: '15px' }}>
            <div className="team-name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
              SANIKA PUROHIT I055 SAP-ID 70122500044
              <span style={{ fontSize: '10px', color: 'var(--muted2)', fontFamily: "'Share Tech Mono'" }}></span>
            </div>
            <div className="team-role" style={{ marginTop: '10px', fontSize: '0.9em', color: 'var(--teal)', border: '1px solid rgba(0, 180, 216, 0.4)', background: 'rgba(0, 180, 216, 0.1)', padding: '5px', borderRadius: '3px', minHeight: '22px' }}></div>
            <div className="team-desc" style={{ marginTop: '10px', fontSize: '0.8em', color: '#666' }}></div>
          </div>
        </div>

        {/* Developer 2 */}
        <div className="team-card" style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', width: '300px', textAlign: 'center' }}>
          
          <div className="team-info" style={{ marginTop: '15px' }}>
            <div className="team-name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
             Swasti Paliwal I049 Sap ID - 70122500039
              <span style={{ fontSize: '10px', color: 'var(--muted2)', fontFamily: "'Share Tech Mono'" }}></span>
            </div>
            <div className="team-role" style={{ marginTop: '10px', fontSize: '0.9em', color: 'var(--amber)', border: '1px solid rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.1)', padding: '5px', borderRadius: '3px' }}></div>
            <div className="team-desc" style={{ marginTop: '10px', fontSize: '0.8em', color: '#666' }}></div>
          </div>
        </div>

        {/* Developer 3 */}
        <div className="team-card" style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', width: '300px', textAlign: 'center' }}>
          
          <div className="team-info" style={{ marginTop: '15px' }}>
            <div className="team-name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
              AVNI DUTT SHARMA I066 SAP ID - 70122500071
              <span style={{ fontSize: '10px', color: 'var(--muted2)', fontFamily: "'Share Tech Mono'" }}></span>
            </div>
           <div className="team-role" style={{ marginTop: '10px', fontSize: '0.9em', color: 'var(--teal)', border: '1px solid rgba(0, 180, 216, 0.4)', background: 'rgba(0, 180, 216, 0.1)', padding: '5px', borderRadius: '3px' }}></div>
            <div className="team-desc" style={{ marginTop: '10px', fontSize: '0.8em', color: '#666' }}></div>
          </div>
        </div>

        {/* Developer 4 */}
        <div className="team-card" style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', width: '300px', textAlign: 'center' }}>
          
          <div className="team-info" style={{ marginTop: '15px' }}>
            <div className="team-name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
              LISA SIDDIQUI I069 Sap ID- 70122500034
              <span style={{ fontSize: '10px', color: 'var(--muted2)', fontFamily: "'Share Tech Mono'" }}></span>
            </div>
            <div className="team-role" style={{ marginTop: '10px', fontSize: '0.9em', color: 'var(--teal)', border: '1px solid rgba(0, 180, 216, 0.4)', background: 'rgba(0, 180, 216, 0.1)', padding: '5px', borderRadius: '3px' }}></div>
            <div className="team-desc" style={{ marginTop: '10px', fontSize: '0.8em', color: '#666' }}></div>
          </div>
        </div>

        
        </div>
      </div>
  );
}

export default Team;
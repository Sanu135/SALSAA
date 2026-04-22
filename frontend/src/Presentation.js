import React from 'react';

function Presentation() {
  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '0', 
        paddingTop: '56.25%', 
        boxShadow: '0 2px 8px 0 rgba(63,69,81,0.16)', 
        marginTop: '1.6em', 
        marginBottom: '0.9em', 
        overflow: 'hidden', 
        borderRadius: '8px', 
        willChange: 'transform' 
      }}>
        <iframe 
          loading="lazy" 
          style={{ 
            position: 'absolute', 
            width: '100%', 
            height: '100%', 
            top: '0', 
            left: '0', 
            border: 'none', 
            padding: '0',
            margin: '0' 
          }}
          src="https://www.canva.com/design/DAG_ihzl2CU/KfHsIBiNdoQN4o6Lmf8V7w/view?embed" 
          allowFullScreen="allowfullscreen" 
          allow="fullscreen"
          title="The Skeletal System Education Presentation">
        </iframe>
      </div>
      <a 
        href="https://www.canva.com/design/DAG_ihzl2CU/KfHsIBiNdoQN4o6Lmf8V7w/view?utm_content=DAG_ihzl2CU&utm_campaign=designshare&utm_medium=embeds&utm_source=link" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        The Skeletal System Education Presentation in Cream Yellow Blue Lined Style
      </a> 
    </div>
  );
}

export default Presentation;
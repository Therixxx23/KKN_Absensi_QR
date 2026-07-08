import logoSrc from '../assets/logokkn.png';

function Logo({ maxWidth = 200 }) {
  return (
    <div style={{ maxWidth, width: '100%', margin: '0 auto 24px auto' }}>
      <img
        src={logoSrc}
        alt="Logo KKN"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
        }}
      />
    </div>
  );
}

export default Logo;

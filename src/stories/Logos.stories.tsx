import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Logos',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Get all logo files
const logos = [
  'ChatGPT.svg',
  'Claude.svg',
  'Figma.svg',
  'Git.svg',
  'IG.svg',
  'LinkedIN.png',
  'nextjs black.svg',
  'nextjs white.svg',
  'npm.svg',
  'React.svg',
  'mark.svg',
  'storybook.svg',
  'stripe-new.png',
  'vercel black.svg',
  'vercel white.svg',
  'vite.svg',
  'X.png',
];

const LogoCard = ({ filename }: { filename: string }) => {
  const name = filename.replace(/\.(svg|png)$/, '');

  return (
    <div
      style={{
        padding: '24px',
        border: '1px solid var(--color-bg-container-border)',
        borderRadius: '8px',
        backgroundColor: 'var(--color-bg-container-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-action-primary-border)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-bg-container-border)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div
        style={{
          width: '100%',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={`/logos/${filename}`}
          alt={name}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
      <div
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          textAlign: 'center',
          fontFamily: 'monospace',
        }}
      >
        {name}
      </div>
    </div>
  );
};

export const AllLogos: Story = {
  render: () => (
    <div style={{ maxWidth: '1400px' }}>
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '12px',
        }}
      >
        Logo Library
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          marginBottom: '32px',
          lineHeight: '1.5',
        }}
      >
        Collection of {logos.length} product and platform logos in SVG and PNG format.
        All logos are stored in <code style={{
          backgroundColor: 'var(--color-bg-container-secondary)',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '13px',
          fontFamily: 'monospace',
        }}>/public/logos/</code>
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '16px',
        }}
      >
        {logos.map((logo) => (
          <LogoCard key={logo} filename={logo} />
        ))}
      </div>
    </div>
  ),
};

export const LightBackground: Story = {
  render: () => (
    <div style={{ maxWidth: '1400px' }}>
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '12px',
        }}
      >
        Logos on Light Background
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          marginBottom: '32px',
          lineHeight: '1.5',
        }}
      >
        Preview logos on a light background to check visibility and contrast.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '16px',
        }}
      >
        {logos.map((logo) => {
          const name = logo.replace(/\.(svg|png)$/, '');
          return (
            <div
              key={logo}
              style={{
                padding: '24px',
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={`/logos/${logo}`}
                  alt={name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#303030',
                  textAlign: 'center',
                  fontFamily: 'monospace',
                }}
              >
                {name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  ),
};

export const DarkBackground: Story = {
  render: () => (
    <div style={{ maxWidth: '1400px' }}>
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '12px',
        }}
      >
        Logos on Dark Background
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          marginBottom: '32px',
          lineHeight: '1.5',
        }}
      >
        Preview logos on a dark background to check visibility and contrast.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '16px',
        }}
      >
        {logos.map((logo) => {
          const name = logo.replace(/\.(svg|png)$/, '');
          return (
            <div
              key={logo}
              style={{
                padding: '24px',
                border: '1px solid #303030',
                borderRadius: '8px',
                backgroundColor: '#0E0E0E',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={`/logos/${logo}`}
                  alt={name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#F1F1F1',
                  textAlign: 'center',
                  fontFamily: 'monospace',
                }}
              >
                {name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  ),
};

'use client';

export default function FrameSelector({
  onOrientationSelected,
}: {
  onOrientationSelected: (orientation: 'portrait' | 'landscape') => void;
}) {
  return (
    <div className="frame-selector">
      <h3>Selecionar Orientação da Moldura</h3>
      <div className="orientation-buttons">
        <button
          onClick={() => onOrientationSelected('portrait')}
          className="btn btn-outline orientation-btn portrait"
        >
          <div className="frame-preview portrait-preview" />
          Retrato (15x21)
        </button>
        <button
          onClick={() => onOrientationSelected('landscape')}
          className="btn btn-outline orientation-btn landscape"
        >
          <div className="frame-preview landscape-preview" />
          Paisagem (21x15)
        </button>
      </div>
    </div>
  );
}

'use client';

/**
 * The shader scene block: a scene of your own on a stage, with a slider for
 * each setting it declares. The scene is `emberScene` in
 * components/blocks/emberScene.ts; edit its GLSL and this page follows.
 */

import { useState } from 'react';
import {
  SHADER_PASSES,
  ShaderScene,
  shaderSceneDefaults,
  type ShaderSceneStatus,
  type ShaderSceneValues,
} from 'rift-ds/components/ShaderScene/ShaderScene';
import { Slider } from 'rift-ds/components/Slider/Slider';
import { emberScene } from '../../components/blocks/emberScene';
import styles from './page.module.css';

const SPEED = 1.6;

/* What the scene reads each frame: its own settings and every finishing
   pass, at their defaults, with the two fades off so the light fills the
   stage. */
const initialValues = (): ShaderSceneValues => ({
  speed: SPEED,
  scene: shaderSceneDefaults(emberScene.params),
  passes: Object.fromEntries(
    SHADER_PASSES.map((pass) => [
      pass.id,
      { on: pass.id.startsWith('fade') ? false : pass.on, params: shaderSceneDefaults(pass.params) },
    ])
  ),
});

export default function ShaderScenePage() {
  /* The sliders write this ref and the scene reads it every frame, so a
     drag moves the picture without rendering the page. */
  const [values] = useState(() => ({ current: initialValues() }));

  const [status, setStatus] = useState<ShaderSceneStatus>('pending');
  const [error, setError] = useState<string>();

  return (
    <div className={styles.page}>
      <div className={styles.stage}>
        <ShaderScene scene={emberScene} liveRef={values} onStatusChange={setStatus} onError={setError} />
      </div>

      <main className={styles.panel}>
        <div className={styles.intro}>
          <h1 className={styles.title}>Ember</h1>
          <p className={styles.subhead}>A scene of your own, in the theme’s colours.</p>
        </div>

        {emberScene.params.map((param) => (
          <Slider
            key={param.key}
            label={param.label}
            min={param.min}
            max={param.max}
            step={param.step}
            defaultValue={param.default}
            showValue
            onValueChange={(value) => {
              values.current.scene[param.key] = value;
            }}
          />
        ))}

        {status === 'unavailable' && (
          <p className={styles.note} role="status">
            {error ? 'The scene did not compile:' : 'This browser cannot run the scene.'}
          </p>
        )}
        {error && <pre className={styles.log}>{error}</pre>}
      </main>
    </div>
  );
}

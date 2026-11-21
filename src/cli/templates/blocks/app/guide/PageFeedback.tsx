'use client';
/**
 * "Was this page helpful?" at the foot of a docs page: a thumbs Rating, then
 * an optional note once the reader answers. Send the answer to your
 * analytics in `send` below; nothing is sent anywhere as written.
 */

import { useState } from 'react';
import { Button } from 'rift-ds/components/Button/Button';
import { Rating } from 'rift-ds/components/Rating/Rating';
import { Textarea } from 'rift-ds/components/Textarea/Textarea';
import styles from './page.module.css';

export function PageFeedback() {
  const [answer, setAnswer] = useState(0);
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);

  // Replace with a call to your analytics or feedback endpoint.
  const send = () => setSent(true);

  if (sent) {
    return <p className={styles.feedbackThanks}>Thanks for telling us.</p>;
  }
  return (
    <div className={styles.feedback}>
      <div className={styles.feedbackRow}>
        <span id="page-feedback-question" className={styles.feedbackQuestion}>
          Was this page helpful?
        </span>
        <Rating
          variant="thumbs"
          aria-labelledby="page-feedback-question"
          upLabel="Yes"
          downLabel="No"
          value={answer}
          onValueChange={setAnswer}
        />
      </div>
      {answer > 0 && (
        <div className={styles.feedbackNote}>
          <Textarea
            label={answer === 1 ? 'What helped? (optional)' : 'What was missing? (optional)'}
            size="compact"
            value={note}
            onValueChange={setNote}
          />
          <div>
            <Button variant="secondary" size="compact" label="Send" onClick={send} />
          </div>
        </div>
      )}
    </div>
  );
}

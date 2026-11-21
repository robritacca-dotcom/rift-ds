"use client";

import { FullBleedBackground } from "../components/BlurBackground/BlurBackground";
import { Button } from "rift-ds/components/Button/Button";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <>
      <FullBleedBackground />
      <div className={styles.container}>
        <div className={`${styles.content} animate-in`}>
          <span className={styles.errorCode}>404</span>
          <h1 className={styles.title}>Page not found</h1>
          <p className={styles.description}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Button
            label="Back to home"
            variant="secondary"
            iconLeft="arrow_back"
            href="/"
          />
        </div>
      </div>

    </>
  );
}

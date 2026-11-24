'use client';

/**
 * The settings block's profile section: a form that checks every field in
 * one pass when it is saved. The checks write one record of messages by
 * field name; fieldErrorsFrom turns it into ErrorSummary's list and each
 * field's errorText, so the summary and the fields can never disagree.
 * Replace `check` with your own rules, or with the errors your server
 * returns.
 */

import { useState } from 'react';
import { Button } from 'rift-ds/components/Button/Button';
import { ErrorSummary, fieldErrorsFrom } from 'rift-ds/components/ErrorSummary/ErrorSummary';
import { FormSection } from 'rift-ds/components/FormSection/FormSection';
import { Input } from 'rift-ds/components/Input/Input';

const FIELDS = ['firstName', 'lastName', 'email'] as const;
type Field = (typeof FIELDS)[number];

function check(values: Record<Field, string>): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};
  if (!values.firstName.trim()) errors.firstName = 'Enter your first name.';
  if (!values.lastName.trim()) errors.lastName = 'Enter your last name.';
  if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = 'Enter an email address like name@example.com.';
  return errors;
}

export function ProfileForm() {
  const [values, setValues] = useState<Record<Field, string>>({
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
  });
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  const { errors, errorText } = fieldErrorsFrom(submitted ? check(values) : {}, {
    order: [...FIELDS],
    idFor: (name) => `profile-${name}`,
  });

  const set = (field: Field) => (value: string) => {
    setSaved(false);
    setValues((current) => ({ ...current, [field]: value }));
  };

  const save = () => {
    setSubmitted(true);
    // Save here when the check passes, and show what your server returns.
    setSaved(Object.keys(check(values)).length === 0);
  };

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <ErrorSummary errors={errors} />
      <FormSection
        layout="aside"
        columns={2}
        title="Profile"
        description="How you appear to the people you work with."
        actions={<Button type="submit" label={saved ? 'Saved' : 'Save profile'} />}
      >
        <Input
          id="profile-firstName"
          label="First name"
          value={values.firstName}
          onValueChange={set('firstName')}
          errorText={errorText.firstName}
          required
        />
        <Input
          id="profile-lastName"
          label="Last name"
          value={values.lastName}
          onValueChange={set('lastName')}
          errorText={errorText.lastName}
          required
        />
        <Input
          id="profile-email"
          label="Email"
          type="email"
          value={values.email}
          onValueChange={set('email')}
          errorText={errorText.email}
          required
        />
      </FormSection>
    </form>
  );
}

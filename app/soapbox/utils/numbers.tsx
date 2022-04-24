import React from 'react';
import { FormattedNumber } from 'react-intl';

/** Check if a value is REALLY a number. */
export const isNumber = (number: unknown): boolean => typeof number === 'number' && !isNaN(number);

/** Display a number nicely for the UI, eg 1000 becomes 1K. */
export const shortNumberFormat = (number: any): React.ReactNode => {
  if (!isNumber(number)) return '•';

  if (number < 1000) {
    return <FormattedNumber value={number} />;
  } else {
    return <span><FormattedNumber value={number / 1000} maximumFractionDigits={1} />K</span>;
  }
};

/** Check if an entity ID is an integer (eg not a FlakeId). */
export const isIntegerId = (id: string): boolean => new RegExp(/^-?[0-9]+$/g).test(id);

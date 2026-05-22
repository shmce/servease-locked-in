import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildProviderServiceDescription,
  validateProviderSignupRequirements,
} from './providerRegistration';

test('provider signup validation requires admin approval inputs', () => {
  assert.equal(
    validateProviderSignupRequirements({
      businessName: 'GreenFix Home Services',
      birthdate: '1995-05-23',
      contactNumber: '+639171234567',
      experienceYears: '3',
      serviceArea: 'Quezon City',
      serviceDescription: 'Aircon cleaning and repair',
    }),
    null,
  );

  assert.match(
    validateProviderSignupRequirements({
      businessName: 'GreenFix Home Services',
      birthdate: '1995-05-23',
      contactNumber: '',
      experienceYears: '3',
      serviceArea: 'Quezon City',
      serviceDescription: 'Aircon cleaning and repair',
    }) ?? '',
    /contact number/i,
  );

  assert.match(
    validateProviderSignupRequirements({
      businessName: 'GreenFix Home Services',
      birthdate: '1995-05-23',
      contactNumber: '+639171234567',
      experienceYears: 'many',
      serviceArea: 'Quezon City',
      serviceDescription: 'Aircon cleaning and repair',
    }) ?? '',
    /years of experience/i,
  );
});

test('provider signup validation requires providers to be at least 18', () => {
  const validProviderSignup = {
    businessName: 'GreenFix Home Services',
    birthdate: '2008-05-23',
    contactNumber: '+639171234567',
    experienceYears: '3',
    serviceArea: 'Quezon City',
    serviceDescription: 'Aircon cleaning and repair',
  };

  assert.equal(
    validateProviderSignupRequirements(validProviderSignup, {
      today: '2026-05-23',
    }),
    null,
  );

  assert.match(
    validateProviderSignupRequirements(
      {
        ...validProviderSignup,
        birthdate: '',
      },
      { today: '2026-05-23' },
    ) ?? '',
    /birthdate/i,
  );

  assert.match(
    validateProviderSignupRequirements(
      {
        ...validProviderSignup,
        birthdate: '2008-05-24',
      },
      { today: '2026-05-23' },
    ) ?? '',
    /at least 18/i,
  );

  assert.match(
    validateProviderSignupRequirements(
      {
        ...validProviderSignup,
        birthdate: '05/23/2008',
      },
      { today: '2026-05-23' },
    ) ?? '',
    /YYYY-MM-DD/i,
  );
});

test('provider signup service description preserves web registration shape', () => {
  assert.equal(
    buildProviderServiceDescription('Aircon cleaning and repair', '3'),
    'Aircon cleaning and repair - 3 years experience',
  );

  assert.equal(
    buildProviderServiceDescription('Electrical repairs', '1'),
    'Electrical repairs - 1 year experience',
  );
});

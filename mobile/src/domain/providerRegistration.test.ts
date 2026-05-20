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
      contactNumber: '+639171234567',
      experienceYears: 'many',
      serviceArea: 'Quezon City',
      serviceDescription: 'Aircon cleaning and repair',
    }) ?? '',
    /years of experience/i,
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

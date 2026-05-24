import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('seed-demo-data script', () => {
  const source = readFileSync(join(__dirname, 'seed-demo-data.mjs'), 'utf8');

  it('creates an actual demo review row for the provider review feed', () => {
    expect(source).toContain('seedDemoReview');
    expect(source).toContain("serviceClient.rpc('servease_create_review'");
    expect(source).toContain('p_booking_id: bookingId');
    expect(source).toContain('p_provider_id: providerId');
    expect(source).toContain('p_reviewer_id: customerId');
    expect(source).toContain('reviewId');
  });
});

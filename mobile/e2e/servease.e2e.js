describe('ServEase mobile shell', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('launches into the authentication shell', async () => {
    await expect(element(by.text('Customer'))).toBeVisible();
  });
});

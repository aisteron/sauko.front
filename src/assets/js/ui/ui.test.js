describe('/ (home page)', _ => {

	let page;
	
	beforeAll(async () => {
		page = await globalThis.__BROWSER_GLOBAL__.newPage();
		await page.setViewport({
			width: 1920,
			height: 1080,
			deviceScaleFactor: 1,
		});
		await page.goto('http://localhost:7071');
	});

	

	it('click on tel will show social popup', async () => {
	
		await page.click('.tel .icon-tr')
		await page.waitForSelector('.tel .wrap', {visible: true})

	});

	it('click on cur will show currency popup', async () => {
		await page.click('header .cur.dd')
		await page.waitForSelector('.cur .wrap', {visible: true})
		//await page.screenshot({ path: `./home.jpg` });
	})

	it('calendar loaded', async () => {
		
		await page.waitForSelector('.flatpickr-calendar', {visible: true})
		
	})
	
}
);
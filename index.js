const express = require('express');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { eachOfSeries } = require('async');
const app = express();

const CERT_DATA = require('./assets/data.json');

const PORT = 5000;
const IMG_HEIGHT = 2084;
const IMG_WIDTH = 3126;
const HTML_START = `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Certificate</title>
		<style>
			body {
				background-color: black;
				height: 2084px;
				width: 3126px;
				padding: 0;
				margin: 0;
			}
			@font-face {
				font-family: cacChampagne;
				src: url('/assets/cac_champagne.ttf');
			}
			@font-face {
				font-family: libre;
				src: url('/assets/libre/LibreFranklin-VariableFont_wght.ttf');
			}
			.floating {
				position: absolute;
			}
			.certid {
				font-family: libre;
				font-size: 37px;
				font-weight: 600;
				letter-spacing: 4px;
				top: 165px;
				left: 1660px;
			}
			.certname {
				font-family: cacChampagne;
				color: #534741;
				font-size: 150px;
				top: 930px;
				left: 1550px;
				transform: translateX(-50%);
			}
			.certroll {
				font-family: libre;
				font-size: 40px;
				font-weight: 600;
				letter-spacing: 4px;
				top: 1160px;
				left: 1320px;
				transform: translateX(-50%);
			}
			.certteam {
				font-family: libre;
				font-size: 45px;
				font-weight: 600;
				letter-spacing: 4px;
				top: 1330px;
				left: 1100px;
				transform: translateX(-50%);
			}
			.certrole {
				font-family: libre;
				font-size: 45px;
				font-weight: 600;
				letter-spacing: 4px;
				top: 1330px;
				left: 2170px;
				transform: translateX(-50%);
			}
		</style>
	</head>
	<body>`;
const HTML_IMAGE = `<img src="/assets/template.jpg" alt="image" />`;
const HTML_END = `	</body>
</html>`;

app.use('/assets', express.static('./assets'));

app.get('/gen/all', async (_req, res) => {
	try {
		const browser = await puppeteer.launch({
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});
		const page = await browser.newPage();
		await page.setViewport({
			width: IMG_WIDTH,
			height: IMG_HEIGHT,
			deviceScaleFactor: 1,
		});

		await eachOfSeries(CERT_DATA, async (record, index) => {
			console.log(`Processing #${index + 1} of ${CERT_DATA.length} | ${record.ID} | ${record.ROLE} | ${record.NAME}`);
			await page.goto(`http://localhost:5000/view/${record.ID}`, { waitUntil: 'networkidle0' });
			return page.screenshot({ path: path.join(__dirname, `generated\\${record.ID}.png`) });
		});

		await browser.close();
		res.send({ status: 'Success!' });
	} catch (err) {
		res.send(err);
	}
});

app.get('/gen/:id', async (req, res) => {
	try {
		const browser = await puppeteer.launch({
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});
		const page = await browser.newPage();
		await page.setViewport({
			width: IMG_WIDTH,
			height: IMG_HEIGHT,
			deviceScaleFactor: 1,
		});

		await page.goto(`http://localhost:5000/view/${req.params.id}`, { waitUntil: 'networkidle0' });
		await page.screenshot({ path: path.join(__dirname, `generated\\${req.params.id}.png`) });

		await browser.close();
		res.sendFile(path.join(__dirname, `generated\\${req.params.id}.png`));
	} catch (err) {
		res.send(err);
	}
});

app.get('/view/:id', (req, res) => {
	try {
		const [_data] = CERT_DATA.filter((x) => x.ID === req.params.id);
		const HTML_ID = `<div class="floating certid">${_data.ID}</div>`;
		const HTML_NAME = `<div class="floating certname">${_data.NAME}</div>`;
		const HTML_ROLL = `<div class="floating certroll">${_data.ROLL}</div>`;
		const HTML_TEAM = `<div class="floating certteam">${_data.TEAM}</div>`;
		const HTML_ROLE = `<div class="floating certrole">${_data.ROLE}</div>`;
		const TOTAL_HTML = `${HTML_START}
			${HTML_IMAGE}
			${HTML_ID}
			${HTML_NAME}
			${HTML_ROLL}
			${HTML_TEAM}
			${HTML_ROLE}
	${HTML_END}`;
		fs.writeFileSync(path.join(__dirname, `output.html`), TOTAL_HTML);
		res.sendFile(path.join(__dirname, `output.html`));
	} catch (err) {
		res.send(err);
	}
});

app.listen(process.env.PORT || PORT, () => {
	console.log('now listening for requests on port 5000');
});

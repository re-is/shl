function createGraph(graph) {

	if (!graph['chart']) return window.alert('createGraph({\n\n   chart :   HTMLElement   is not found!\n\n});\n');
	if (!graph['items']) return window.alert('createGraph({\n\n   items :   Array[...]   is not defined!\n\n});\n');

	let chart = graph['chart'],
		items = graph['items'],
		balance = [],
		profit = 0,
		highLmt = 0,
		downLmt = 0,
		highVal = items[0],
		downVal = items[0],
		highIndex = 0,
		downIndex = 0,
		// Main Line ------------------------------->
		mainLine = (graph['mainL'] || [2, '#000', '']),
		mainLineColor = '#000',
		mainLineWidth = mainLine[0],
		mainLineFill = (mainLine[1] ? (function(colors) {
			mainLineColor = colors[0];
			return (colors[1] || 'transparent');
		})(mainLine[1].split(' ')) : 'transparent'),
		mainLineType = ((mainLine[2] === 'dashed') ? ((mainLineWidth * 4) + ',3') : (mainLine[2] === 'dotted') ? mainLineWidth : 0),
		m_05 = (mainLineWidth * 0.5),
		// Zero Line ------------------------------->
		zeroLine = (graph['zeroL'] || [0, 'transparent', '']),
		zeroLineColor = '#000',
		zeroLineWidth = zeroLine[0],
		zeroLineFill = (zeroLine[1] ? (function(colors) {
			zeroLineColor = colors[0];
			return (colors[1] || 'transparent');
		})(zeroLine[1].split(' ')) : 'transparent'),
		zeroLineType = ((zeroLine[2] === 'dashed') ? ((zeroLineWidth * 4) + ',3') : (zeroLine[2] === 'dotted') ? zeroLineWidth : 0),
		z_05 = (zeroLineWidth * 0.5),
		// Trend Line ------------------------------>
		trendLine = (graph['trendL'] || [0, 'transparent', '']),
		trendLineWidth = trendLine[0],
		trendLineColor = (trendLine[1] ? trendLine[1] : '#000'),
		trendLineType = ((trendLine[2] === 'dashed') ? ((trendLineWidth * 4) + ',3') : (trendLine[2] === 'dotted') ? trendLineWidth : 0);

		if (items.length === 1) mainLineColor = mainLineFill = trendLineColor = 'transparent';

				for (let i = 0; i < items.length; i++) {
					profit += items[i];
					// Legmagasabb érték:
					if (profit > highLmt) highLmt = profit;
					if (profit >= highVal) {
						highIndex = i;
						highVal = profit;
					}
					// Legalacsonyabb érték:
					if (profit < downLmt) downLmt = profit;
					if (profit <= downVal) {
						downIndex = i;
						downVal = profit;
					}
					balance.push(profit);
				}

	let chartWidth = chart.clientWidth,
		chartHeight = (chart.clientHeight - (mainLineWidth * 2)),
		stepX = (chartWidth / (items.length - 1)),
		stepY = (chartHeight / (highLmt - downLmt)),
		x = 0, y = 0, mainPoints = '', trendPoints = '', html = '',
		hAbs = [], hRel = [], lAbs = [], lRel = [];

				for (let i = 0; i < balance.length; i++) {
					y = (chartHeight - ((balance[i] - downLmt) * stepY));
					// Kezdőpont:
					if (i === 0) {
						mainPoints += ((-m_05) + ',' + chartHeight + ' ' + (-m_05) + ',' + y + ' ' + m_05 + ',' + y + ' ');
						trendPoints += ('-1,' + y + ' ');
					}
					// Végpont:
					else if (i === (balance.length - 1)) {
						mainPoints += ((chartWidth - m_05) + ',' + y + ' ' + (chartWidth + m_05) + ',' + y + ' ' + (chartWidth + m_05) + ',' + chartHeight);
						trendPoints += ((chartWidth + 1) + ',' + y);
					}
					else {
						x += stepX;
						mainPoints += (x + ',' + y + ' ');
					}
				}

	let zeroLevel = (chartHeight + (downLmt * stepY)),
		zeroHeight = ((zeroLevel > (chartHeight - z_05)) ? (chartHeight - z_05) : zeroLevel),
		zeroPoints = ((-z_05) + ',' + chartHeight + ' ' + (-z_05) + ',' + zeroHeight + ' ' + (chartWidth + z_05) + ',' + zeroHeight + ' ' + (chartWidth + z_05) + ',' + chartHeight);

	// SVG:
	html += ('<svg style="position:absolute;margin-top:' + (mainLineWidth * 2) + 'px;overflow:visible;z-index:1" width="' + chartWidth + '" height="' + chartHeight + '"><polyline points="' + mainPoints + '" style="stroke:' + mainLineColor + ';stroke-width:' + mainLineWidth + 'px;fill:' + mainLineFill + ';stroke-dasharray:' + mainLineType + ';"></svg>');
	html += ('<svg style="position:absolute;margin-top:' + (mainLineWidth * 2) + 'px;overflow:visible;z-index:1" width="' + chartWidth + '" height="' + chartHeight + '"><polyline points="' + zeroPoints + '" style="stroke:' + zeroLineColor + ';stroke-width:' + zeroLineWidth + 'px;fill:' + zeroLineFill + ';stroke-dasharray:' + zeroLineType + ';"></svg>');
	html += ('<svg style="position:absolute;margin-top:' + (mainLineWidth * 2) + 'px;overflow:visible;z-index:1" width="' + chartWidth + '" height="' + chartHeight + '"><polyline points="' + trendPoints + '" style="stroke:' + trendLineColor + ';stroke-width:' + trendLineWidth + 'px;fill:transparent;stroke-dasharray:' + trendLineType + ';"></svg>');
	// Integrálás:
	chart.style.overflow = 'hidden';
	chart.innerHTML = html;

	// Absolute, Relative pontok lekérése:
	let svgOffset = chart.getElementsByTagName('svg')[0].getBoundingClientRect(),
		doc = document.documentElement,
		top = (svgOffset.top + window.pageYOffset - doc.clientTop),
		left = (svgOffset.left + window.pageXOffset - doc.clientLeft),
		mainLinePoints = mainPoints.split(' '),
		zeroLinePoints = zeroPoints.split(' '),
		zeroY = Number(zeroLinePoints[1].split(',')[1]),
		zeroRel = [[0, Math.ceil(zeroY)], [chartWidth, Math.ceil(zeroY)]],
		zeroAbs = [[left, (top + zeroRel[0][1])], [(left + chartWidth), (top + zeroRel[1][1])]],
		trndRel = [[0, Math.ceil(Number(mainLinePoints[1].split(',')[1]))], [chartWidth, Math.ceil(Number(mainLinePoints[mainLinePoints.length-2].split(',')[1]))]],
		trndAbs = [[left, (top + trndRel[0][1])], [(left + chartWidth), (top + trndRel[1][1])]],
		mainAbs = [], mainRel = [], xy, dayTick = 86400000, today = (new Date().setHours(0,0,0,0) + dayTick); // --> ma éjfél

				for (let i = 0; i < (mainLinePoints.length - 4); i++) {
					xy = mainLinePoints[i+2].split(',');
					x = Math.ceil(xy[0]);
					y = Math.ceil(xy[1]);
					mainRel.push([x, y]);
					mainAbs.push([(left + x), (top + y)]);
					// Alsó-felső pontok:
					if (highIndex === i) {
						hRel = [x, y];
						hAbs = [(left + x), (top + y)];
					}
					if (downIndex === i) {
						lRel = [x, y];
						lAbs = [(left + x), (top + y)];
					}
					// Dátum futtatása:
					if (graph['onDate']) graph['onDate'](new Date(Math.ceil(today - (((items.length - 1) - i) * dayTick))), [x, y], [chart.clientWidth, chart.clientHeight], [left, top]);
				}

	return {
		chart	: chart,
		top		: top,
		left	: left,
		width	: chart.clientWidth,
		height	: chart.clientHeight,
		highest	: { point: { abs: hAbs, rel: hRel }, limit: highLmt, value: highVal },
		lowest	: { point: { abs: lAbs, rel: lRel }, limit: downLmt, value: downVal },
		items	: { original: items, combined: balance },
		points	: {
			main  : { abs: mainAbs, rel: mainRel },
			zero  : { abs: zeroAbs, rel: zeroRel },
			trend : { abs: trndAbs, rel: trndRel }
		}
	}
}
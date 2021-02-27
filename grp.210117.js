function createGraph(graph) {

	if (!graph['chart']) return window.alert('createGraph({\n\n   chart :   HTMLElement   is not found!\n\n});\n');
	if (!graph['items']) return window.alert('createGraph({\n\n   items :   Array[...]   is not defined!\n\n});\n');

	let chartClass = graph['chart'],
		chart = document.getElementsByClassName(chartClass)[0],
		items = graph['items'],
		balance = [],
		profit = 0,
		highestChartValue = 0,
		lowestChartValue = 0,
		highestLineValue = items[0],
		lowestLineValue = items[0],
		highestColumnValue = 0,
		lowestColumnValue = 0,
		highIndex = 0,
		downIndex = 0,
		// Main Line ------------------------------------------>
		mainLineWidth = 2, m_05 = 1, existMain = false,
		// Zero Line ------------------------------------------>
		z1_05 = 1, exist1zero = false, z2_05 = 1, exist2zero = false,
		// Trend Line ----------------------------------------->
		trendLineWidth = 2, existTrend = false,
		// Column --------------------------------------------->
		columnWidth = 0.5, existColumn = false;

		let sheets = document.styleSheets, sheet;
		for (sheet in sheets) {
			if (!sheets.hasOwnProperty(sheet)) continue;
			let rules = sheets[sheet].cssRules, rule;
			for (rule in rules) {
				if (!rules.hasOwnProperty(rule)) continue;
				// Main Line ------------------------------->
				if (rules[rule].selectorText === ('.graph-' + chartClass + '-main')) {
					mainLineWidth = (parseInt(rules[rule].style['stroke-width']) || 2);
					m_05 = (mainLineWidth * 0.5);
					existMain = true;
				}
				// Zero1 Line ------------------------------>
				if (rules[rule].selectorText === ('.graph-' + chartClass + '-zero1')) {
					z1_05 = ((parseInt(rules[rule].style['stroke-width']) || 2) * 0.5);
					exist1zero = true;
				}
				// Zero2 Line ------------------------------>
				if (rules[rule].selectorText === ('.graph-' + chartClass + '-zero2')) {
					z2_05 = ((parseInt(rules[rule].style['stroke-width']) || 2) * 0.5);
					exist2zero = true;
				}
				// Trend Line ------------------------------>
				if (rules[rule].selectorText === ('.graph-' + chartClass + '-trend')) {
					trendLineWidth = (parseInt(rules[rule].style['stroke-width']) || 2);
					existTrend = true;
				}
				// Column ---------------------------------->
				if ((items[0] !== 0) && (rules[rule].selectorText === ('.graph-' + chartClass))) {
					columnWidth = ((parseInt(rules[rule].style['max-width']) * 0.01) || 1);
					existColumn = true;
				}
			}
		}

				if (items[0] !== 0) for (let i = 0; i < items.length; i++) {
					profit += items[i];
					// Legmagasabb érték:
					if (items[i] > highestColumnValue) highestColumnValue = items[i];
					if (profit > highestChartValue) highestChartValue = profit;
					if (profit >= highestLineValue) {
						highIndex = i;
						highestLineValue = profit;
					}
					// Legalacsonyabb érték:
					if (items[i] < lowestColumnValue) lowestColumnValue = items[i];
					if (profit < lowestChartValue) lowestChartValue = profit;
					if (profit <= lowestLineValue) {
						downIndex = i;
						lowestLineValue = profit;
					}
					balance.push(profit);
				}

	if (items.length < 2) {
		existMain = false;
		exist1zero = false;
		existTrend = false;
	}

	let chartWidth = chart.clientWidth,
		chartHeight = chart.clientHeight,
		chartInnerHeight = (chartHeight - mainLineWidth),
		stepX = (chartWidth / (items.length - 1)),
		stepY = (chartInnerHeight / (highestChartValue - lowestChartValue)),
		stepXC = (chartWidth / items.length),
		stepYC = (chartHeight / (highestColumnValue - lowestColumnValue)),
		x = 0, y = 0, mainPoints = '', trendPoints = '', html = '', mleft = (stepXC * 0.5), mtop = 0, columnHeight = 0,
		hAbs = [], hRel = [], lAbs = [], lRel = [];

				if (existMain) for (let i = 0; i < balance.length; i++) {
					y = (chartInnerHeight - ((balance[i] - lowestChartValue) * stepY));
					// Kezdőpont:
					if (i === 0) {
						mainPoints += ((-m_05) + ',' + chartInnerHeight + ' ' + (-m_05) + ',' + y + ' ' + m_05 + ',' + y + ' ');
						trendPoints += ('-1,' + y + ' ');
					}
					// Végpont:
					else if (i === (balance.length - 1)) {
						mainPoints += ((chartWidth - m_05) + ',' + y + ' ' + (chartWidth + m_05) + ',' + y + ' ' + (chartWidth + m_05) + ',' + chartInnerHeight);
						trendPoints += ((chartWidth + 1) + ',' + y);
					}
					else {
						x += stepX;
						mainPoints += (x + ',' + y + ' ');
					}
				}

				if (existColumn) for (let i = 0; i < items.length; i++) {
					// Oszlop magassága:
					columnHeight = Math.round(items[i] * stepYC);
					// Margin emelése a lowest értékkel:
					mtop = ((columnHeight >= 0) ? ((lowestColumnValue * stepYC) + 1) : (-(columnHeight - (lowestColumnValue * stepYC)) - 1));
					html += '<div class="graph-' + chartClass + '" style="position:absolute;width:' + (stepXC * columnWidth) + 'px;height:' + Math.abs(columnHeight) + 'px;margin-left:' + mleft + 'px;margin-top:' + (chartHeight + mtop) + 'px;transform:translate(-50%, -100%);box-sizing:border-box;border' + ((columnHeight >= 0) ? '-bottom' : '-top') + ':none;"></div>';
					mleft += stepXC;
				}

	let zero1Level = Math.round(chartInnerHeight + (lowestChartValue * stepY)),
		zero1Height = ((zero1Level > (chartInnerHeight - z1_05)) ? (chartInnerHeight - z1_05) : zero1Level),
		zero1Points = ((-z1_05) + ',' + chartInnerHeight + ' ' + (-z1_05) + ',' + zero1Height + ' ' + (chartWidth + z1_05) + ',' + zero1Height + ' ' + (chartWidth + z1_05) + ',' + chartInnerHeight),
		zero2Level = Math.round(chartHeight + (lowestColumnValue * stepYC)),
		zero2Height = ((zero2Level > (chartHeight - z2_05)) ? (chartHeight - z2_05) : zero2Level),
		zero2Points = ((-z2_05) + ',' + chartHeight + ' ' + (-z2_05) + ',' + zero2Height + ' ' + (chartWidth + z2_05) + ',' + zero2Height + ' ' + (chartWidth + z2_05) + ',' + chartHeight);

	// SVG:
	if (existMain) html += ('<svg style="position:absolute;margin-top:' + mainLineWidth + 'px;overflow:visible;z-index:1;" width="' + chartWidth + '" height="' + chartInnerHeight + '"><polyline points="' + mainPoints + '" class="graph-' + chartClass + '-main"></svg>');
	if (exist1zero) html += ('<svg style="position:absolute;margin-top:' + mainLineWidth + 'px;overflow:visible;z-index:1;" width="' + chartWidth + '" height="' + chartInnerHeight + '"><polyline points="' + zero1Points + '" class="graph-' + chartClass + '-zero1"></svg>');
	if (existTrend) html += ('<svg style="position:absolute;margin-top:' + mainLineWidth + 'px;overflow:visible;z-index:1;" width="' + chartWidth + '" height="' + chartInnerHeight + '"><polyline points="' + trendPoints + '" class="graph-' + chartClass + '-trend"></svg>');
	if (existColumn) html += ('<svg style="position:absolute;overflow:visible;z-index:1;" width="' + chartWidth + '" height="' + chartInnerHeight + '"><polyline points="' + zero2Points + '" class="graph-' + chartClass + '-zero2"></svg>');
	// Integrálás:
	chart.style.overflow = 'hidden';
	chart.innerHTML = html;

	// Absolute, Relative pontok lekérése:
	let svgElem = chart.getElementsByTagName('svg')[0],
		svgOffset = (svgElem ? svgElem.getBoundingClientRect() : {}),
		doc = document.documentElement,
		top = (svgOffset.top + window.pageYOffset - doc.clientTop),
		left = (svgOffset.left + window.pageXOffset - doc.clientLeft),
		mainLinePoints = mainPoints.split(' '),
		zero1LinePoints = zero1Points.split(' '),
		zero1Y = Number(zero1LinePoints[1].split(',')[1]),
		zero1Rel = [[0, Math.round(zero1Y)], [chartWidth, Math.round(zero1Y)]],
		zero1Abs = [[left, (top + zero1Rel[0][1])], [(left + chartWidth), (top + zero1Rel[1][1])]],
		trndRel = (mainLinePoints[1] ? [[0, Math.round(Number(mainLinePoints[1].split(',')[1]))], [chartWidth, Math.round(Number(mainLinePoints[mainLinePoints.length-2].split(',')[1]))]] : []),
		trndAbs = (mainLinePoints[1] ? [[left, (top + trndRel[0][1])], [(left + chartWidth), (top + trndRel[1][1])]] : []),
		mainAbs = [], mainRel = [], xy;

				if (existMain) for (let i = 0; i < (mainLinePoints.length - 4); i++) {
					xy = mainLinePoints[i+2].split(',');
					x = Math.round(xy[0]);
					y = Math.round(xy[1]);
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
					if (graph['onItem']) graph['onItem'](i, [x, y], [chartWidth, chartHeight], [left, top]);
				}

				x = (stepXC * 0.5);
				if (existColumn) for (let i = 0; i < items.length; i++) {
					if (graph['onItem']) graph['onItem'](i, [x, 0], [chartWidth, chartHeight], [left, top]);
					x += stepXC;
				}

	return {
		chart	: chart,
		top		: top,
		left	: left,
		width	: chartWidth,
		height	: chartHeight,
		highest	: { point: { abs: hAbs, rel: hRel }, chartValue: highestChartValue, lineValue: highestLineValue },
		lowest	: { point: { abs: lAbs, rel: lRel }, chartValue: lowestChartValue, lineValue: lowestLineValue },
		items	: { original: items, combined: balance },
		points	: {
			main  : { abs: mainAbs, rel: mainRel },
			zero1 : { abs: zero1Abs, rel: zero1Rel },
			trend : { abs: trndAbs, rel: trndRel }
		}
	}
}

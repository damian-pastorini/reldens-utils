/**
 *
 * Reldens - TestPageRangeProvider
 *
 */

const assert = require('assert');
const PageRangeProvider = require('../lib/page-range-provider');
const { UnitTestMethodRunner } = require('./unit-test-method-runner');

class TestPageRangeProvider extends UnitTestMethodRunner
{

    constructor()
    {
        super('PageRangeProvider');
    }

    testPageRangeProviderLastLinkOpensTheLastPage()
    {
        this.test('the last link opens the last page', () => {
            assert.deepStrictEqual(PageRangeProvider.fetch(1, 10), [
                {label: 1, value: 1},
                {label: 2, value: 2},
                {label: 3, value: 3},
                {label: 4, value: 4},
                {label: 5, value: 5},
                {label: 'last', value: 10}
            ]);
        });
    }

    testPageRangeProviderFirstLinkOpensTheFirstPage()
    {
        this.test('the first link opens the first page', () => {
            assert.deepStrictEqual(PageRangeProvider.fetch(10, 10), [
                {label: 'first', value: 1},
                {label: 6, value: 6},
                {label: 7, value: 7},
                {label: 8, value: 8},
                {label: 9, value: 9},
                {label: 10, value: 10}
            ]);
        });
    }

    testPageRangeProviderMiddlePageShowsBothLinks()
    {
        this.test('a middle page shows the first and the last links around its range', () => {
            assert.deepStrictEqual(PageRangeProvider.fetch(5, 10, 3, 'First', 'Last'), [
                {label: 'First', value: 1},
                {label: 4, value: 4},
                {label: 5, value: 5},
                {label: 6, value: 6},
                {label: 'Last', value: 10}
            ]);
        });
    }

    testPageRangeProviderSinglePageHasNoNavigationLinks()
    {
        this.test('a single page has no first or last links', () => {
            assert.deepStrictEqual(PageRangeProvider.fetch(1, 1), [{label: 1, value: 1}]);
        });
    }

}

module.exports.TestPageRangeProvider = TestPageRangeProvider;

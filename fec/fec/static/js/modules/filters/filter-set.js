'use strict';

var $ = require('jquery');
var _ = require('underscore');
var URI = require('urijs');

var helpers = require('../helpers');
var TextFilter = require('./text-filter').TextFilter;
var CheckboxFilter = require('./checkbox-filter').CheckboxFilter;
var MultiFilter = require('./multi-filter').MultiFilter;
var TypeaheadFilter = require('./typeahead-filter').TypeaheadFilter;
var SelectFilter = require('./select-filter').SelectFilter;
var DateFilter = require('./date-filter').DateFilter;
var ElectionFilter = require('./election-filter').ElectionFilter;
var ToggleFilter = require('./toggle-filter').ToggleFilter;
var RangeFilter = require('./range-filter').RangeFilter;

/**
 * @param {jQuery.fn} elm
 */
function FilterSet(elm) {
  console.log('FilterSet(elm): ', elm);
  this.$body = $(elm);
  $(document.body).on('tag:removed', this.handleTagRemoved.bind(this));

  this.$body.on('filters:validation', this.handleValidation.bind(this));
  this.efiling = this.$body.data('efiling-filters') || false;

  this.fields = [];
  this.isValid = true;
  this.firstLoad = true;
  this.filters = {};
  this.efilingFilters = {};
  this.processedFilters = {};
}

var filterMap = {
  text: TextFilter,
  checkbox: CheckboxFilter,
  date: DateFilter,
  typeahead: TypeaheadFilter,
  election: ElectionFilter,
  multi: MultiFilter,
  select: SelectFilter,
  toggle: ToggleFilter,
  range: RangeFilter
};

/**
 * 
 * @param {*} $elm 
 * @returns {(CheckboxFilter|DateFilter|ElectionFilter|MultiFilter|RangeFilter|SelectFilter|TextFilter|
 *     ToggleFilter|TypeaheadFilter)}
 */
 FilterSet.prototype.buildFilter = function($elm) {
  console.log('filter-set buildFilter($elm): ', $elm);
  var filterType = $elm.attr('data-filter');
  var F = filterMap[filterType].constructor;
  return new F($elm);
};

/**
 * 
 * @param {jQuery.fn} $selector
 * @returns 
 */
FilterSet.prototype.activate = function($selector) {
  console.log('filter-set activate($selector): ', $selector);
  var self = this;
  var query = helpers.sanitizeQueryParams(
    URI.parseQuery(window.location.search)
  );
  var filters = _.chain($selector)
    .map(function(elm) {
      var filter = self.buildFilter($(elm)); // .fromQuery(query);
      return [filter.name, filter];
    })
    .object()
    .value();
  var fields = _.chain(filters)
    .pluck('fields')
    .flatten()
    .value();

  // Activate each filter
  _.each(filters, function(filter) {
    filter.fromQuery(query);
  });

  // Store all field key-values in this.fields and return the filters object
  this.fields = this.fields.concat(fields);
  return filters;
};

FilterSet.prototype.activateProcessed = function() {
  console.log('filter-set activateProcessed()');
  if (_.isEmpty(this.processedFilters)) {
    var $filters = this.$body.find('.js-processed-filters .js-filter');
    this.processedFilters = this.activate($filters);
    // Store the processed filters in this.filters for later reference
    this.filters = this.processedFilters;
  }
};

FilterSet.prototype.activateEfiling = function() {
  if (_.isEmpty(this.efilingFilters)) {
    var $filters = this.$body.find('.js-efiling-filters .js-filter');
    this.efilingFilters = this.activate($filters);
    // Store the efiling filters in this.filters for later reference
    this.filters = this.efilingFilters;
  }
};

FilterSet.prototype.activateDataType = function() {
  console.log('filter-set activateDataType()');
  var $filter = this.$body.find('#data-type-toggle .js-filter');
  this.activate($filter);
};

FilterSet.prototype.activateAll = function() {
  console.log('filter-set activateAll()');
  // If the panel uses efiling filters, activate the data type filter
  // and activate the others when necessary
  if (this.efiling) {
    this.activateDataType();
  } else {
    this.filters = this.activate(this.$body.find('.js-filter'));
    console.log('    this.filters (return of this.activate): ', this.filters);
  }
  return this;
};

FilterSet.prototype.serialize = function() {
  console.log('filter-set.serialize()');
  var seralizedArray = this.$body.find('input,select').serializeArray();
  console.log('    seralizedArray: ', seralizedArray);
  var toReturn = _.reduce(
    seralizedArray,
    function(memo, val) {
      if (val.value && val.name.slice(0, 1) !== '_') {
        if (memo[val.name]) {
          memo[val.name].push(val.value);
        } else {
          memo[val.name] = [val.value];
        }
      }
      return memo;
    },
    {}
  );
  console.log('    toReturn: ', toReturn);
  return toReturn;
};

FilterSet.prototype.clear = function() {
  _.each(this.filters, function(filter) {
    filter.setValue();
  });
};

/**
 * 
 * @param {jQuery.event} e
 * @param {Object}  opts
 * @param {*}       opts.key
 */
FilterSet.prototype.handleTagRemoved = function(e, opts) {
  console.log('filter-set handleTagRemoved(e, opts): ', e, opts);
  var $input = $(document.getElementById(opts.key));
  if ($input.length > 0) {
    var type = $input.get(0).type;

    if (type === 'checkbox' || type === 'radio') {
      $input.click();
    } else if (type === 'text') {
      $input.val('').trigger('change');
    }
  }
};

/**
 * 
 * @param {*} e 
 * @param {Object}  opts
 * @param {Boolean} opts.isValid
 */
FilterSet.prototype.handleValidation = function(e, opts) {
  console.log('filter-set handleValidation(e, opts): ', e, opts);
  this.isValid = opts.isValid;
};

/**
 * 
 * @param {String} dataType
 */
FilterSet.prototype.switchFilters = function(dataType) {
  console.log('filter-set switchFilters(dataType): ', dataType);
  // Identify which filter group to show and which to hide
  var currentFilters = '.js-' + dataType + '-filters';
  var otherFilters =
    dataType == 'efiling' ? '.js-processed-filters' : '.js-efiling-filters';

  // Toggle visibility of filters
  this.$body.find(otherFilters).attr('aria-hidden', true);
  this.$body.find(currentFilters).attr('aria-hidden', false);

  // If necessary activate the filters
  if (dataType === 'efiling' && _.isEmpty(this.efilingFilters)) {
    this.activateEfiling();
  } else if (dataType === 'processed' && _.isEmpty(this.processedFilters)) {
    this.activateProcessed();
  }

  this.activateSwitchedFilters(dataType);
};

/**
 * 
 * @param {*} dataType 
 */
FilterSet.prototype.activateSwitchedFilters = function(dataType) {
  console.log('filter-set activateSwitchedFilters(dataType): ', dataType);
  // Save the current query for later
  var query = helpers.sanitizeQueryParams(
    URI.parseQuery(window.location.search)
  );

  // Set forceRemove: true to clear date filters that are usually nonremovable
  this.$body.trigger('tag:removeAll', {
    forceRemove: true,
    fromFilterSet: true
  });
  // Go through the current panel and set loaded-once on each input
  // So that they don't show loading indicators
  _.each(this.filters, function(filter) {
    filter.loadedOnce = false;
    filter.$elm.find('input').data('loaded-once', false);
  });

  // If there was a previous query, combine the two
  if (this.previousQuery) {
    query = _.extend({}, this.previousQuery, query);
  }

  // Identify which set of filters to activate and store as this.filters
  this.filters =
    dataType === 'efiling' ? this.efilingFilters : this.processedFilters;

  _.each(this.filters, function(filter) {
    filter.fromQuery(query);
  });

  this.previousQuery = query;
  this.firstLoad = false;
};

module.exports = { FilterSet: FilterSet };

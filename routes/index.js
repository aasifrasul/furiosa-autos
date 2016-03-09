var express = require('express');
var router = express.Router();
var api = require('../lib/api');
var sortValues = ['Ascending', 'Descending', 'None'];


var compareModels = function(a, b) {
    if (a > b) {
        return 1;
    }
    if (a < b) {
        return -1;
    }
    return 0;
}

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index');
});

/*
* Task 1:
* Make models alphabetically sortable (ascending, descending, default)
*/
router.get('/models', function(req, res, next) {
	return Promise.all([api.fetchModels()])
		.then(function(models) {
			res.render('models', {models: models[0], sort: 'default'});
		});
});
router.post('/models', function(req, res, next) {
	console.log(req.body);
	return Promise.all([api.fetchModels()])
		.then(function(models) {
			var sortedModels = models[0];
			if(req.body.sort == 'Ascending') {
				sortedModels = sortedModels.sort(compareModels);
			}
			if(req.body.sort == 'Descending') {
				sortedModels = sortedModels.sort(compareModels).reverse(); 
			}
			res.render('models', {models: sortedModels, sortValues: sortValues, sort: req.body.sort});
		});
});
/*
* Task 2:
* Make services filterable by type (repair, maintenance, cosmetic)
*/
router.get('/services', function(req, res, next) {
	return Promise.all([api.fetchServices()])
		.then(function(services) {
			var filterValues = [];
			var filteredServices = services[0];
			var type = '';
			for (var i = 0; i < filteredServices.length; i++) {
				type = filteredServices[i].type;
				if(-1 == filterValues.indexOf(type)) filterValues.push(type);
			}
			res.render('services', {services: filteredServices, filterValues: filterValues, filterSelectedValues: []});
		});
});
router.post('/services', function(req, res, next) {
	return Promise.all([api.fetchServices()])
		.then(function(services) {
			var filterValues = [];
			var filterSelectedValues = {};
			var filteredServices = [];
			var allServices = services[0];
			var type = '';
			for (var i = 0; i < allServices.length; i++) {
				type = allServices[i].type;
				if(-1 == filterValues.indexOf(type)) filterValues.push(type);
				if( type == req.body[type]) {
					filteredServices.push(allServices[i]);
					filterSelectedValues[type] = 'checked';
				}
			}
			res.render('services', {services: filteredServices, filterValues: filterValues, filterSelectedValues: filterSelectedValues});
		});
});

/*
* Task 3:
* Bugfix: Something prevents reviews from being rendered
* Make reviews searchable (content and source)
*/
router.get('/reviews', function(req, res, next) {
	return Promise.all([api.fetchCustomerReviews(), api.fetchCorporateReviews()])
		.then(function(reviews) {
			res.render('reviews', {customerReviews: reviews[0], corporateReviews: reviews[1]});
		});
});
router.post('/reviews', function(req, res, next) {
	return Promise.all([api.fetchCustomerReviews(), api.fetchCorporateReviews()])
		.then(function(reviews) {
			var customerReviews = [];
			var corporateReviews = [];
			var review = null;
			reviews = reviews || [];
			reviews[0] = reviews[0] || [];
			reviews[1] = reviews[1] || [];
			for (var i = 0; i < reviews[0].length; i++) {
				review = reviews[0][i];
				if(-1 != review.content.indexOf(req.body.search)) customerReviews.push(review);
			}
			for (var i = 0; i < reviews[1].length; i++) {
				review = reviews[1][i];
				if(-1 != review.content.indexOf(req.body.search)) corporateReviews.push(review);
			}
			res.render('reviews', {customerReviews: customerReviews, corporateReviews: corporateReviews});
		});
});

module.exports = router;

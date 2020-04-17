const cheerio = require('cheerio');
const got = require('got');

const imdb_endpoint =
  'https://www.imdb.com/search/title/?title_type=feature&user_rating=5,&num_votes=2500,&countries=in&languages=hi&view=simple&sort=release_date,desc&year=2020';

const tmdb_endpoint = 'https://api.themoviedb.org/3/find/';
const tmdb_params =
  '?api_key=***REMOVED***&language=en-US&external_source=imdb_id';

const imdb_ids = [];
const ret_arr = [];

exports.result = async (req, res) => {
  await got(imdb_endpoint)
    .then((response) => {
      const $ = cheerio.load(response.body);

      $('.lister-item-image').filter(function () {
        var element = $(this);
        imdb_ids.push(
          element
            .children()
            .first()
            .attr('href')
            .match(/title\/(.*)\//)[1]
        );
      });

      console.log(imdb_ids + '\n');
    })
    .catch((err) => {
      console.log(err);
    });

  await asyncForEach(imdb_ids, async (el) => {
    const mov_obj = await got(tmdb_endpoint + el + tmdb_params, {
      responseType: 'json',
    }).then((response) => {
      return response.body.movie_results[0];
    });
    ret_arr.push(mov_obj);
  });

  console.log(ret_arr);
  res.set('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify({ ret_arr }));
};

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

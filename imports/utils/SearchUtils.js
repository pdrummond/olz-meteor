import { Cards } from '../api/cards';
import { Hashtags } from '../api/hashtags';

export default SearchUtils = {
  getFilterQuery(filterString) {
    console.log("> getFilterQuery");
    let hashtags = [];
    var filter = {};
    var remainingText = filterString;
    //var re = new RegExp("([\\w\\.-]+)\\s*:\\s*([\\w\\.-]+)", "g");
    var re = new RegExp("([\\w\\.@#-]+)\\s*([ :]\\s*([\\w\\.-]+))?", "g");
    var match = re.exec(filterString);
    while (match != null) {
      var field = match[1].trim();
      var value = match.length > 2 && match[2] != null ? match[2].trim().replace(':', '') : null;
      console.log("-- field: " + field);
      console.log("-- value: " + value);
      remainingText = remainingText.replace(field, '');
      if(value != null) {
        remainingText = remainingText.replace(value, '');
      }
      remainingText = remainingText.replace(/:/g, '');
      if(field.startsWith('#')) {
        hashtags.push(field.replace('#', ''));
      } else if(field == 'open') {
        field = "isOpen";
      } else if(field == 'closed') {
        field = "isOpen";
        value = (value=="true" ? "false" : "true");
      }

      if(value) {
        if(value == "true") {
          value = true;
        } else if(value == "false") {
          value = false;
        }
        filter[field] = value;
      }
      match = re.exec(filterString);
    }
    if(remainingText && remainingText.length > 0) {
      filter["$or"] = [{title: {$regex:remainingText}}, {content: {$regex:remainingText}}];
    }
    console.log("getFilterQuery: Current client-side item filter is: " + JSON.stringify(filter));
    let result = {
      filter,
      hashtags
    }
    console.log(" -- result:" + JSON.stringify(result, null, 2));
    console.log("< getFilterQuery");
    return result;
  },

  filterCards(opts) {
    let cardIds = [];
    opts.filter = opts.filter || {};
    if(!_.isEmpty(opts.hashtags) ) {
      Hashtags.find({name: {$in: opts.hashtags}}).forEach(function (hashtag) {
        let card = Cards.findOne(hashtag.cardId);
        cardIds.push(card._id);
      });

      opts.filter._id = {$in: cardIds};
    }
    console.log("BOOM:" + JSON.stringify(opts.filter));
    return Cards.find(opts.filter);
  }
}

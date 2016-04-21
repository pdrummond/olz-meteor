import { Cards } from '../api/cards';
import { Hashtags } from '../api/hashtags';
import { Members } from '../api/members';

export default SearchUtils = {
  getFilterQuery(filterString) {
    console.log("> getFilterQuery");
    let hashtags = [];
    var filter = {};
    var remainingText = filterString;
    //var re = new RegExp("([\\w\\.-]+)\\s*:\\s*([\\w\\.-]+)", "g");
    var re = new RegExp("([\\w\\.@#-]+)\\s*([ :]\\s*([\\w\\.,-]+))?", "g");
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
        if(value.indexOf(',') != -1) {
          filter[field] = {$in: value.split(',')};
        } else {
          if(value == "true") {
            value = true;
          } else if(value == "false") {
            value = false;
          }
          filter[field] = value;
        }
      }
      match = re.exec(filterString);
    }
    if(remainingText && remainingText.trim().length > 0) {
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

  filterCards(userId, opts, pubType) {
    var sort = (pubType == 'homeCards' ? { sort: { updatedAt: -1 } } : { sort: { createdAt: 1 } });
    opts.filter = opts.filter || {};
    let allowedCardIds = null;
    console.log("userId: " + userId);
    //Firstly, we check if there are any hashtags to filter on and build a list of allowed card
    if(!_.isEmpty(opts.hashtags)) {
      allowedCardIds = [];
      Hashtags.find({name: {$in: opts.hashtags}}).forEach(function (hashtag) {
        let card = Cards.findOne(hashtag.cardId);
        allowedCardIds.push(card._id);
      });
    }
    //Now we build up a list of cards that the user is allowed to see based on membership
    //(and only add them if they are already in the allowedCardIds)
    let cardIds = [];
    Members.find({userId}).forEach(function (member) {
      let cards = Cards.find({outerCardId: member.cardId}).fetch();
      cards.forEach((card) => {
        if(allowedCardIds == null) {
          cardIds.push(card._id);
        } else if(_.contains(allowedCardIds, card._id)) {
          cardIds.push(card._id);
        }
      });
    });

    console.log("cardIds: " + JSON.stringify(cardIds));
    opts.filter._id = {$in: cardIds};
    console.log("FILTER:" + JSON.stringify(opts.filter));
    return Cards.find(opts.filter, sort);
  }
}

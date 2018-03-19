import showdown from 'showdown'

function trim(str) {
  return str.replace(/(^\s*)|(\s*$)/, '')
}

export default class MdConvertor {
  constructor() {
    this.header = []
  }

  init() {
    var that = this
    showdown.extension('custom-header-id', () => {
      var rgx = /^(\#{1,6})([^\#\n]+)$/gim // eslint-disable-line

      return [
        {
          type: 'listener',
          listeners: {
            'headers.before': function(
              event,
              text,
              converter,
              options,
              globals
            ) {
              text = text.replace(rgx, function(wm, hLevel, hText, hCustomId) {
                // find how many # there are at the beginning of the header
                // these will define the header level
                hLevel = hLevel.length
                that.header.push({
                  wm,
                  hLevel,
                  hText: trim(hText),
                  hCustomId
                })
                // since headers can have markdown in them (ex: # some *italic* header)
                // we need to pass the text to the span parser
                hText = showdown.subParser('spanGamut')(hText, options, globals)
                hText = trim(hText)

                // create the appropriate HTML
                var header =
                  '<h' +
                  hLevel +
                  ' id="' +
                  hText +
                  '">' +
                  hText +
                  '</h' +
                  hLevel +
                  '>'

                // hash block to prevent any further modification
                return showdown.subParser('hashBlock')(header, options, globals)
              })

              // return the changed text
              return text
            }
          }
        }
      ]
    })
    return new showdown.Converter({ extensions: ['custom-header-id'] })
  }
}
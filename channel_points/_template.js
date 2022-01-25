const cpItem = require('./_interface')

module.exports = new class Item extends cpItem {
   constructor() {
      super()
      this.id = 'CHANGE_ME';

      super.register({ id: '00000000-0000-0000-0000-000000000000', cooldown: 0, userCooldown: 0, event: false })

   }

   onRedeem(redemption) {

   }
}

/*
redemption array:
{
   "id":"44da97bf-f070-46df-82b8-cbddaabaed3f",
   "user":{
      "id":"37433468",
      "login":"[REDACTED]",
      "display_name":"[REDACTED]"
   },
   "channel_id":"37433468",
   "redeemed_at":"2020-09-11T08:00:50.814416425Z",
   "reward":{
      "id":"bc8eabf4-3b9a-490e-9859-79927cf4162c",
      "channel_id":"37433468",
      "title":"Hydrate!",
      "prompt":"Do I look thirsty?",
      "cost":1000,
      "is_user_input_required":true,
      "is_sub_only":false,
      "image":null,
      "default_image":{
         "url_1x":"https://static-cdn.jtvnw.net/custom-reward-images/tree-1.png",
         "url_2x":"https://static-cdn.jtvnw.net/custom-reward-images/tree-2.png",
         "url_4x":"https://static-cdn.jtvnw.net/custom-reward-images/tree-4.png"
      },
      "background_color":"#57B1EB",
      "is_enabled":true,
      "is_paused":false,
      "is_in_stock":false,
      "max_per_stream":{
         "is_enabled":false,
         "max_per_stream":1
      },
      "should_redemptions_skip_request_queue":true,
      "template_id":"template:41d5eae8-4deb-4541-b681-ebdcb3125c0f",
      "updated_for_indicator_at":"2020-09-11T07:54:21.328672472Z",
      "max_per_user_per_stream":{
         "is_enabled":false,
         "max_per_user_per_stream":5
      },
      "global_cooldown":{
         "is_enabled":true,
         "global_cooldown_seconds":60
      },
      "redemptions_redeemed_current_stream":0,
      "cooldown_expires_at":"2020-09-11T08:01:50Z"
   },
   "user_input":"yayayayaya",
   "status":"FULFILLED"
}

*/
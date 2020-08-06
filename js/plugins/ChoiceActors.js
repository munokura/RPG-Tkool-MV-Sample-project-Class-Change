//============================================================================
// ChoiceActors.js
// ver1.00 2017/11/01
//============================================================================
// ver1.01 2020/02/17 プラグインパラメーターとヘルプを調整

/*:
 * @plugindesc アクター選択肢作成プラグイン
 * @author KPoal
 *
 * @param AChoiceVariableNumber
 * @text アクターIDを受け取る変数番号
 * @type variable
 * @desc 選択したアクターのアクターIDを受け取る変数番号です。
 * @default 30
 *
 * @param CancelChoiceMessage
 * @text キャンセル用選択肢
 * @desc cancelchoiceで追加できる、キャンセル用選択肢の内容です。
 * @default キャンセル
 *
 *
 * @help
 * 条件を満たすアクターのみで選択肢を作り、
 * 選択されたアクターのアクターIDを変数に取得するプラグインです。
 * 選択肢がキャンセルされた場合は0を取得します。
 *
 * ・基本プラグインコマンド
 * ChoiceActors all   全てのアクターで選択肢を作ります。
 * ChoiceActors party パーティにいるアクターで選択肢を作ります。
 * ChoiceActors alive パーティにいて生存しているアクターで選択肢を作ります。
 * ChoiceActors dead  パーティにいて死亡しているアクターで選択肢を作ります。
 *
 * ・追加プラグインコマンド(基本コマンドの直前に実行して下さい)
 * ChoiceActors 文           :選択肢の前に文を表示します。
 *                            文の途中に半角スペースを入れる事で改行できます。
 * ChoiceActors nocancel       :選択肢でのキャンセルを禁止します。
 * ChoiceActors position left  :選択肢を左側に表示します。
 * ChoiceActors position center :選択肢を中央に表示します。
 * ChoiceActors back dark      :選択肢の背景を暗くします。
 * ChoiceActors back clear     :選択肢の背景を透明にします。
 * ChoiceActors cancelchoice   :選択肢の最後にキャンセル用選択肢を追加します。
 * ChoiceActors allclear
 *        :追加プラグインコマンドによる全ての設定をリセットします。
 *
 * ・条件付きプラグインコマンド例(アクターを条件で絞り込む場合)
 * ChoiceActors all actor.isStateAffected(4)
 *  :ステート4番になっている全てのアクター
 * ChoiceActors party actor.mhp>5000&&actor.mmp>100
 *  :最大HP5000以上、最大MP100以上のパーティメンバー
 * ChoiceActors alive !actor.isLearnedSkill(12)
 *  :スキル12番を覚えていない生存メンバー
 *
 *
 * 使用例
 * 「アクターを選択してください」という文章を表示した上で、
 * ステート10番になっていないパーティメンバーのみで選択肢を作り、
 * 選択肢のキャンセルを禁止する場合
 * -------------------------------------------------
 * ChoiceActors アクターを選択してください
 * ChoiceActors nocancel
 * ChoiceActors party !actor.isStateAffected(10)
 * -------------------------------------------------
 *
 * このプラグインはMITライセンスです。
 *
 */

(function() {
    var parameters = PluginManager.parameters('ChoiceActors');
    var ChoiceActorvariableId = Number(parameters.AChoiceVariableNumber);
    var CCMessage = String(parameters.CancelChoiceMessage);
    var choices =[];
    var choiceAtype = 0;
    var PrereqA='true';
    var ActorChoice = false;
    var coiceMessage= [];
    var ACcancelType= -2;
    var ACpositionType=2;
    var ACbackground= 0;
    var ChoiceCancel=false;

    var _Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
_Game_Interpreter_pluginCommand.call(this, command, args);
if (command === 'ChoiceActors') {
    if (args[1]){
        PrereqA=String(args[1]);
    }else{
        PrereqA='true';
    }
    switch (args[0]) {
    case 'all':
        choiceAtype = 0;
        this.setupChoiceActors();
        this.setWaitMode('message');
        break;
    case 'party':
        choiceAtype = 1;
        this.setupChoiceActors();
        this.setWaitMode('message');
        break;
    case 'alive':
        choiceAtype = 2;
        this.setupChoiceActors();
        this.setWaitMode('message');
        break;
    case 'dead':
        choiceAtype = 3;
        this.setupChoiceActors();
        this.setWaitMode('message');
        break;
    case 'nocancel':
        ACcancelType= -1;
        break;
    case 'position':
        if(args[1]=="left"){
            ACpositionType=0;
        }else if(args[1]=="center"){
            ACpositionType=1;
        }else{
            ACpositionType=2;
        }
        break;
    case 'back':
        if(args[1]=="dark"){
            ACbackground=1;
        }else if(args[1]=="clear"){
            ACbackground=2;
        }else{
            ACbackground=0;
        }
        break;
    case 'cancelchoice':
        ChoiceCancel=true;
        break;
    case 'allclear':
        coiceMessage= [];
        ACcancelType= -2;
        ACpositionType=2;
        ACbackground= 0;
        ChoiceCancel=false;
        break;
    default:
        coiceMessage[1] = String(args[0]);
        for (var i = 1; i <= 4; i++) {
          if (args[i]){
            coiceMessage[i+1] = String(args[i]);
         }
        }
        break;

    }
 }
};

    Game_Interpreter.prototype.ChoiceAllActors = function() {
        for (var i = 1; i <= $dataActors.length-1; i++) {
            var actor = $gameActors.actor(i)
            if(actor){
                if(eval(PrereqA)){
               choices.push(actor.name());
                }
           }
        }
    }

    Game_Interpreter.prototype.ChoicePartyMembers = function() {
        for (var i = 0; i <= $gameParty.size(); i++) {
          var actor = $gameParty.members()[i]
          if(actor){
            if(eval(PrereqA)){
            choices.push(actor.name());
            }
         }
        }
    }

    Game_Interpreter.prototype.ChoicePartyDead = function() {
        for (var i = 0; i <= $gameParty.deadMembers().length-1; i++) {
          var actor = $gameParty.deadMembers()[i]
          if(actor){
            if(eval(PrereqA)){
            choices.push(actor.name());
            }
         }
        }
    }
    Game_Interpreter.prototype.ChoicePartyAlive = function() {
        for (var i = 0; i <= $gameParty.aliveMembers().length-1; i++) {
          var actor = $gameParty.aliveMembers()[i]
          if(actor){
            if(eval(PrereqA)){
            choices.push(actor.name());
            }
         }
        }
    }

    Game_Interpreter.prototype.setupChoiceActors = function() {
        for (var i = 1; i <= 4; i++) {
         if(coiceMessage[i]){
           $gameMessage.add(coiceMessage[i]);
         }
        }
        coiceMessage =[];
        choices =[];
        ActorChoice = true;
        switch (choiceAtype) {
    case 0:
        this.ChoiceAllActors();
        break;
    case 1:
        this.ChoicePartyMembers();
        break;
    case 2:
        this.ChoicePartyAlive();
        break;
    case 3:
        this.ChoicePartyDead();
        break;
        }
        if(ChoiceCancel){
            choices.push(CCMessage);
        }
        var cancelType = ACcancelType;
        //var defaultType = params.length > 2 ? params[2] : 0;
        var defaultType = 0;
        var positionType = ACpositionType;
        //var background = params.length > 4 ? params[4] : 0;
        var background = ACbackground;
        if (cancelType >= choices.length) {
            cancelType = -2;
        }
        ACcancelType = -2;
        ACpositionType= 2;
        ACbackground= 0;
        ChoiceCancel=false;
        $gameMessage.setChoices(choices, defaultType, cancelType);
        $gameMessage.setChoiceBackground(background);
        $gameMessage.setChoicePositionType(positionType);
        $gameMessage.setChoiceCallback(function(n) {
            this._branch[this._indent] = n;
        }.bind(this));
    };

    var _Window_ChoiceList_prototype_callOkHandler = Window_ChoiceList.prototype.callOkHandler;
    Window_ChoiceList.prototype.callOkHandler = function() {
        if(ActorChoice){
            $gameVariables.setValue(ChoiceActorvariableId, 0);
            for (var i = 1; i <= $dataActors.length-1; i++) {
                var actor = $gameActors.actor(i);
                if(actor){
                   if (choices[this.index()]==actor.name()){
                    $gameVariables.setValue(ChoiceActorvariableId, actor.actorId());
                   }
               }
            }
        }
            ActorChoice = false;
            _Window_ChoiceList_prototype_callOkHandler.call(this);

    };
    var _Window_ChoiceList_prototype_callCancelHandler = Window_ChoiceList.prototype.callCancelHandler;
    Window_ChoiceList.prototype.callCancelHandler = function() {
        if(ActorChoice){
        $gameVariables.setValue(ChoiceActorvariableId, 0);
        }
        ActorChoice = false;
        _Window_ChoiceList_prototype_callCancelHandler.call(this);
    };


    })();

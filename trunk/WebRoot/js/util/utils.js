/**
 * 换肤功能
 */
function changeXtheme() {
	var cookieArr = document.cookie.split(";");
	var cssName = "";
	for (var i = 0; i < cookieArr.length; i++) {
		var arr = cookieArr[i].split("=");
		if (arr[0] == "css") {
			cssName = arr[1];
			break;
		}
	}
	if (cssName) {
		var themeCombo = Ext.getCmp("xthemebox");
		if (themeCombo) {
			themeCombo.setValue(cssName);
		}
		Ext.util.CSS.swapStyleSheet("theme", path
						+ "/js/ext-2.2.1/resources/css/" + cssName + ".css");
	}

}
/**
 * JS replaceAll
 * 
 * @param {}
 *            s1
 * @param {}
 *            s2
 * @return {}
 */
String.prototype.replaceAll = function(s1, s2) {
	return this.replace(new RegExp(s1, "gm"), s2);
};
/**
 * JS trim
 * 
 * @return {}
 */
String.prototype.trim = function() {
	return this.replace(/(^\s*)|(\s*$)/g, "");
};
/**
 * 获取当前页面的菜单ID
 * 
 * @return {}
 */
function getCurrentMenuId() {
	var parentExt = parent.Ext;
	if (parentExt) {
		var tabPanel = parentExt.getCmp("mainTabPanel");
		if (tabPanel) {
			var activePanel = tabPanel.getActiveTab();
			if (activePanel) {
				var tabId = activePanel.id;
				if (tabId) {
					return tabId.split("_")[0];
				}
			}
		}
	}
}
/**
 * 创建/增加/激活tab面板
 * @param {} title 面板标题
 * @param {} tabId 面板唯一ID
 * @param {} tabHref 面板的url
 * @param {} closable 是否可关闭的面板
 */
function createMainTabPanel(title, tabId, tabHref, closable) {
	var tabPanel = Ext.getCmp("mainTabPanel");
	if (!tabPanel) {
		createTabPanel(title, tabId + "_tab", tabHref, closable);
	} else {
		var tabPanelPage = Ext.getCmp(tabId + "_tab");
		if (!tabPanelPage) {
			addTabPanel(tabPanel, tabId + "_tab", title, tabHref, closable);
		} else {
			activeTabPanel(tabPanel, tabId + "_tab");
		}
	}
}
/**
 * 跳转到指定url的tab页面
 * @param {} tabHref 要跳转页面的相对url(不接path变量)
 */
function goToTabPanel(tabHref, menuId){
	Ext.Msg.alert("系统提示","页面跳转中，请稍候...");
	Ext.Ajax.request({
		params:{menuPath:tabHref, menuId:menuId},
		timeout:60000,
		url:path + "/menu/findMenuId.action?method=findMenuId",
		success:function(response,options){
			var msg = Ext.util.JSON.decode(response.responseText);
			if(msg && msg.success){
				Ext.Msg.hide();
				var title = msg.menuText;
				var tabId = msg.menuId;
				var tabUrl = msg.menuUrl;
				if(!tabUrl){
					createMainTabPanel(title, tabId, tabHref, true);
				}else{
					createMainTabPanel(title, tabId, tabUrl, true);
				}
			}else if(msg && !msg.success){
				Ext.Msg.hide();
				Ext.Msg.alert("提示信息","URL信息无效，请检查数据库是否存在该信息！");
			}
		},failure:function(response,options){
			Ext.Msg.hide();
			Ext.Msg.alert("提示信息","系统错误，请联系系统管理员！");
			return;
		}
	});
}
/**
 * 设置某控件为灰, 无法操作
 * @param {} cmpId
 */
function markComponent(cmpId){
	var c = Ext.getCmp(cmpId);
	if(c){
		c.getEl().parent().mask();
	}
}
/**
 * 解除某控件的灰, 可以操作
 * @param {} cmpId
 */
function unMarkComponent(cmpId){
	var c = Ext.getCmp(cmpId);
	if(c){
		c.getEl().parent().unmask();
	}
}

/**
 * 格式化日期(有异常处理)
 * value:一个日期
 * preformat:该日期的格式，如时间为：1999-02-05 19:05:30，其格式应该是：Y-m-d H:i:s
 * 注意该格式一定要匹配，否则异常
 * format:要格式化的日期格式，默认为Y-m-d
 */
function dateFormat(value,preformat,format){
	if(!value){
		return "";
	}
	if(!preformat){
		preformat = "Y-m-d H:i:s";
	}
	if(!format){
		format = "Y-m-d";
	}
	if(value && value!=""){
		try{
			var dt = Date.parseDate(value,preformat);
			if(dt){
				dt = dt.format(format);
				return dt;
			}else{
				return value;
			}
		}catch(e){
			return value;
		}
	}else{
		return value;
	}
}

/**
 * 查询数据标准的下拉框
 */
function getCodeListCombo(){
	var codeStore = new Ext.data.Store({
		proxy:new Ext.data.HttpProxy({
			url:basePath+"common/codelist.action?method=getCodeList"
		}),
		reader:new Ext.data.JsonReader({
			totalProperty:"totalCount",
			root:"codeList"
		},[
			{name:"codeid"},
			{name:"codename"}
		])
	});
	return codeStore;
}
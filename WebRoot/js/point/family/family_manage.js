/**
 * 家庭基本信息管理
 */
function family_manage(){
	/**
	 * 家庭基本信息数据解析
	 */
	var familyListReader = new Ext.data.JsonReader({
		totalProperty : "totalCount",
		root : "familyList",
		successProperty:"success"
	},[
		{name:"familyId"},//家庭ID
		{name:"familyName"},//家庭名称
		{name:"familyCreateDate"},//家庭创建日期
		{name:"familyHouseHolder"},//户主
		{name:"familyAddress"},//家庭地址
		{name:"familyComment"},//家庭简介
		{name:"familyTel"}//联系电话
	]);
	/**
	 * 数据存储
	 */
	var familyListStore = new Ext.data.Store({
		proxy:new Ext.data.HttpProxy({
			url:path+"/family_manage/familyList.action?method=familyList"
		}),
		reader:familyListReader,
		listeners:{
			loadexception:function(dataProxy, type, action, options, response, arg) { 
				var o = Ext.util.JSON.decode(action.responseText);
				if(!o.success){
					Ext.Msg.alert('错误提示',o.msg);
				}
			}
		}
	});
	
	var familyListSM = new Ext.grid.CheckboxSelectionModel();
	var familyListCM = new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),familyListSM,{
		dataIndex:"familyId",
		hidden:true,
		hideable:false//不允许将隐藏的字段显示出来
	},{
		header:"家庭名称",
		dataIndex:"familyName",
		width:150
	},{
		header:"创建日期",
		dataIndex:"familyCreateDate",
		width:150
	},{
		header:"户主",
		dataIndex:"familyHouseHolder",
		width:150
	},{
		header:"家庭地址",
		dataIndex:"familyAddress",
		width:150
	},{
		header:"联系电话",
		dataIndex:"familyTel",
		width:150
	}]);
	
	var familyListDataGrid = new Ext.grid.GridPanel({
		collapsible:true,//是否可以展开
		animCollapse:true,//展开时是否有动画效果
		autoScroll:true,
		width:Ext.get("family_manage").getWidth(),
		height:Ext.get("family_manage").getHeight()-20,
		loadMask:true,//载入遮罩动画（默认）
		frame:true,
		autoShow:true,		
		store:familyListStore,
		renderTo:"family_manage",
		cm:familyListCM,
		sm:familyListSM,
		viewConfig:{forceFit:true},//若父容器的layout为fit，那么强制本grid充满该父容器
		split: true,
		bbar:new Ext.PagingToolbar({
			pageSize:50,//每页显示数
			store:familyListStore,
			displayInfo:true,
			displayMsg:"显示{0}-{1}条记录，共{2}条记录",
			nextText:"下一页",
			prevText:"上一页",
			emptyMsg:"无相关记录"
		}),
		tbar:[]
	});
	
	var loadParam = {};
	loadParam.start = 0;
	loadParam.limit = 50;
	loadParam.userId = userName;
	
	/**
	 * 按钮存储器，尚未执行查询
	 */
	var buttonRightStore = buttonRight();
	/**
	 * 执行权限按钮加载, 并且加载列表数据, 显示权限按钮
	 * see buttonRight.js
	 * loadButtonRight(buttonStore, mainDataStore, dataGrid, pageDiv, params)
	 */
	loadButtonRight(buttonRightStore, familyListStore, familyListDataGrid, "family_manage", loadParam);
	/**
	 * 创建新家庭
	 * @param {} url
	 */
	this.createFamily = function(url){
		var familyForm = getFamilyManageForm(url, false, false);
		var buttons = [{
			text:"保存",
			handler: function(){
				if(familyForm.form.isValid()){
					saveFamilyInfo("addFamilyInfo", familyForm);
				}
			}
		},{
			text:"取消",
			handler: function(){
				var fw = Ext.getCmp("addFamilyInfo");
				if(fw){
					fw.close();
				}
			}
		}];
		showFamilyManageWindow("addFamilyInfo","创建家庭",450, 320, familyForm, null, buttons);
		markComponent("familyCreateDate_field");
	};
	/**
	 * 修改家庭信息
	 * @param {} url
	 */
	this.editFamily = function(url){
		var gridSelectionModel = familyListDataGrid.getSelectionModel();
		var gridSelection = gridSelectionModel.getSelections();
		if(gridSelection.length != 1){
			Ext.MessageBox.alert('提示','请选择一个家庭进行修改！');
		    return false;
		}
		
		var familyForm = getFamilyManageForm(url, false, false);
		var buttons = [{
			text:"保存",
			handler: function(){
				if(familyForm.form.isValid()){
					saveFamilyInfo("editFamilyInfo", familyForm);
				}
			}
		},{
			text:"取消",
			handler: function(){
				var fw = Ext.getCmp("editFamilyInfo");
				if(fw){
					fw.close();
				}
			}
		}];
		showFamilyManageWindow("editFamilyInfo","修改家庭信息",450, 320, familyForm, null, buttons);
		familyForm.getForm().loadRecord(gridSelection[0]);
		markComponent("familyCreateDate_field");
	};
	
	/**
	 * 保存数据
	 * @param {} windowId
	 * @param {} form
	 */	
	function saveFamilyInfo(windowId, form){
		Ext.MessageBox.show({
			msg:"正在保存家庭信息，请稍候...",
			progressText:"正在保存家庭信息，请稍候...",
			width:300,
			wait:true,
			waitConfig: {interval:200},
			icon:Ext.Msg.INFO
		});
		form.getForm().submit({
			timeout:60000,
			success: function(form, action) {
				Ext.Msg.hide();
				var result = Ext.decode(action.response.responseText);
				if(result && result.success){
					var msg = "家庭信息保存成功，现在你可以邀请别人加入您的家庭！";
					if(result.msg){
						msg = result.msg;
					}
					Ext.Msg.alert('系统提示信息', msg, function(btn, text) {
						if (btn == 'ok') {
							familyListStore.reload();
							Ext.getCmp(windowId).close();
						}
					});
				}else if(!result.success){
					var msg = "家庭信息保存失败，请检查您所填信息是否完整无误！";
					if(result.msg){
						msg = result.msg;
					}
					Ext.Msg.alert('系统提示信息', msg);
				}
			},
			failure: function(form, action) {//action.result.errorMessage
				Ext.Msg.hide();
				var msg = "家庭信息保存失败，请检查您的网络连接或者联系管理员！";
				try{
					var result = Ext.decode(action.response.responseText);
					if(result.msg){
						msg = result.msg;
					}
				}catch(e){
					msg = "系统错误：" + e;
				}
				Ext.Msg.alert('系统提示信息', msg);
			}
		});
	}
	
	
	/**
	 * 获取家庭信息表单
	 * @param {} url
	 * @param {} isNull
	 * @param {} readOnly
	 * @return {}
	 */
	function getFamilyManageForm(url, isNull, readOnly){
		var familyManageForm = new Ext.form.FormPanel({
			url:url,
			frame: true,
			labelAlign: 'right',
			labelWidth:70,
			autoScroll:false,
			waitMsgTarget:true,
			viewConfig:{forceFit:true},
			items:[{
				layout:"column",
				border:false,
				labelSeparator:'：',
				items:[{
					layout:"form",
					columnWidth:0.5,
					height:50,
					items:[{
						xtype: 'textfield',
						name:"familyName",
						anchor:"90%",
						fieldLabel:"家庭名称",
						maxLength:200,
						readOnly:readOnly,
						allowBlank:isNull
					}]
				},{
					layout:"form",
					columnWidth:0.5,
					height:50,
					items:[{
						xtype: 'textfield',
						name:"familyHouseHolder",
						anchor:"90%",
						fieldLabel:"家庭户主",
						value:userName,
						maxLength:200,
						readOnly:true,
						allowBlank:isNull
					}]
				}]
			},{
				layout:"column",
				border:false,
				labelSeparator:'：',
				items:[{
					layout:"form",
					columnWidth:0.5,
					height:50,
					items:[{
						xtype: 'textfield',
						name:"familyTel",
						anchor:"90%",
						fieldLabel:"联系电话",
						maxLength:200
					}]
				},{
					layout:"form",
					columnWidth:0.5,
					height:50,
					items:[{
						xtype: 'datefield',
						format:"Y-m-d",
						name:"familyCreateDate",
						id:"familyCreateDate_field",
						anchor:"90%",
						readOnly:true,
						value:new Date(),
						fieldLabel:"创建日期"
					}]
				}]
			},{
				layout:"column",
				border:false,
				labelSeparator:'：',
				items:[{
					layout:"form",
					columnWidth:1,
					height:50,
					items:[{
						xtype: 'textfield',
						name:"familyAddress",
						anchor:"95%",
						fieldLabel:"家庭地址",
						maxLength:200
					}]
				}]
			},{
				layout:"column",
				border:false,
				labelSeparator:'：',
				items:[{
					layout:"form",
					columnWidth:1,
					height:70,
					items:[{
						xtype: 'textarea',
						name:"familyComment",
						anchor:"95%",
						fieldLabel:"家庭简介",
						maxLength:200
					},{
						xtype:"hidden",
						name:"familyId"
					}]
				}]
			}]
		});
		return familyManageForm;
	}
	/**
	 * 公用窗口
	 * @param {} id
	 * @param {} title
	 * @param {} width
	 * @param {} height
	 * @param {} items
	 * @param {} html
	 * @param {} buttons
	 */
	function showFamilyManageWindow(id, title, width, height, items, html, buttons){
		var codeListWindow = new Ext.Window({
			id:id,
			title:title,
			width:width,
			height:height,
			items:items,
			//html:html,
			buttons:buttons,
			modal:true,
			//animateTarget:"giftmanage_div",//动画展示
			layout:"fit",
			resizable:false
		});
		codeListWindow.show();
	}
}

Ext.onReady(function(){
	Ext.QuickTips.init();
	Ext.form.Field.prototype.msgTarget = "under";
	family_manage();
});
IDRegistry.genItemID("drill");
IDRegistry.genItemID("diamondDrill");
IDRegistry.genItemID("iridiumDrill");
Item.createItem("drill", "Mining Drill", {name: "drill"}, {stack: 1});
Item.createItem("diamondDrill", "Diamond Drill", {name: "drill_diamond"}, {stack: 1});
Item.createItem("iridiumDrill", "Iridium Drill", {name: "drill_iridium"}, {stack: 1});
Item.setGlint(ItemID.iridiumDrill, true);
ChargeItemRegistry.registerItem(ItemID.drill, "Eu", 30000, 1);
ChargeItemRegistry.registerItem(ItemID.diamondDrill, "Eu", 30000, 1);
ChargeItemRegistry.registerItem(ItemID.iridiumDrill, "Eu", 1000000, 3);

Item.registerNameOverrideFunction(ItemID.drill, NameOverrides.showItemStorage);
Item.registerNameOverrideFunction(ItemID.diamondDrill, NameOverrides.showItemStorage);
Item.registerNameOverrideFunction(ItemID.iridiumDrill, function(item, name){
	name = NameOverrides.showRareItemStorage(item, name);
	var mode = item.extra? item.extra.getInt("mode") : 0;
	switch(mode){
		case 0:
			name += "\nFortune III mode";
		break;
		case 1:
			name += "\nSilk Touch mode";
		break;
		case 2:
			name += "\n3x3 Fortune III mode";
		break;
		case 3:
			name += "\n3x3 Silk Touch mode";
		break;
	}
	
	return name;
});


Recipes.addShaped({id: ItemID.drill, count: 1, data: Item.getMaxDamage(ItemID.drill)}, [
	" p ",
	"ppp",
	"pxp"
], ['x', ItemID.powerUnit, 0, 'p', ItemID.plateIron, 0]);

Recipes.addShaped({id: ItemID.diamondDrill, count: 1, data: Item.getMaxDamage(ItemID.diamondDrill)}, [
	" a ",
	"ada"
], ['d', ItemID.drill, -1, 'a', 264, 0], ChargeItemRegistry.transportEnergy);

Recipes.addShaped({id: ItemID.iridiumDrill, count: 1, data: Item.getMaxDamage(ItemID.iridiumDrill)}, [
	" a ",
	"ada",
	" e "
], ['d', ItemID.diamondDrill, -1, 'e', ItemID.storageCrystal, -1, 'a', ItemID.plateReinforcedIridium, 0], ChargeItemRegistry.transportEnergy);

UIbuttons.setToolButton(ItemID.iridiumDrill, "button_switch");

UIbuttons.registerSwitchFunction(ItemID.iridiumDrill, function(item){
	var extra = item.extra;
	if(!extra){
		extra = new ItemExtraData();
	}
	var mode = (extra.getInt("mode")+1)%4;
	extra.putInt("mode", mode);
	switch(mode){
	case 0:
		//var enchant = {type: Enchantment.FORTUNE, level: 3};
		Game.message("§eFortune III mode");
	break;
	case 1:
		//var enchant = {type: Enchantment.SILK_TOUCH, level: 1};
		Game.message("§9Silk Touch mode");
	break;
	case 2:
		//var enchant = {type: Enchantment.FORTUNE, level: 3};
		Game.message("§c3x3 Fortune III mode");
	break;
	case 3:
		//var enchant = {type: Enchantment.SILK_TOUCH, level: 1};
		Game.message("§23x3 Silk Touch mode");
	break;
	}
	//extra.removeAllEnchants();
	//extra.addEnchant(enchant.type, enchant.level);
	Player.setCarriedItem(item.id, 1, item.data, extra);
});

ToolType.drill = {
	damage: 0,
	blockTypes: ["stone", "dirt"],
	onDestroy: function(item){
		item.data = Math.min(item.data + this.toolMaterial.energyConsumption - 1, Item.getMaxDamage(item.id));
	},
	onBroke: function(item){return true;},
	onAttack: function(item, mob){
		item.data = Math.min(item.data + this.toolMaterial.energyConsumption - 2, Item.getMaxDamage(item.id));
	},
	calcDestroyTime: function(item, coords, block, params, destroyTime, enchant){
		if(item.data + this.toolMaterial.energyConsumption <= Item.getMaxDamage(item.id)){
			return destroyTime;
		}
		return params.base;
	},
	useItem: function(coords, item, block){
		var side  = coords.side;
		coords = coords.relative;
		block = World.getBlockID(coords.x, coords.y, coords.z);
		if(GenerationUtils.isTransparentBlock(block)){
			for(var i = 9; i < 45; i++){
				var slot = Player.getInventorySlot(i);
				if(slot.id==50){
					slot.count--;
					if(!slot.count) slot.id = 0;
					Player.setInventorySlot(i, slot.id, slot.count, 0);
					World.setBlock(coords.x, coords.y, coords.z, 50, (6 - side)%6);
					break;
				}
			}
		}
	}
}

var extraData;
var dirtBlocksDrop = {13:318, 60:3, 110:3, 198:3, 243:3};
ToolAPI.setTool(ItemID.drill, {energyConsumption: 50, level: 3, efficiency: 8, damage: 3},  ToolType.drill);
ToolAPI.setTool(ItemID.diamondDrill, {energyConsumption: 80, level: 4, efficiency: 16, damage: 4}, ToolType.drill);
ToolAPI.setTool(ItemID.iridiumDrill, {energyConsumption: 800, level: 5, efficiency: 24, damage: 5}, {
	damage: 0,
	blockTypes: ["stone", "dirt"],

	modifyEnchant: function(enchant, item){
		var mode = 0;
		var extra = item.extra || extraData;
		if(extra){
		mode = extra.getInt("mode");}
		
		if(mode%2){
		enchant.silk = true;}
		else{
		enchant.fortune = 3;}
	},
	onDestroy: function(item){
		item.data = Math.min(item.data + this.toolMaterial.energyConsumption - 1, Item.getMaxDamage(item.id));
	},
	onBroke: function(item){return true;},
	onAttack: function(item, mob){
		item.data = Math.min(item.data + this.toolMaterial.energyConsumption - 2, Item.getMaxDamage(item.id));
	},
	calcDestroyTime: function(item, coords, block, params, destroyTime){
		if(item.data + 800 <= Item.getMaxDamage(item.id)){
			extraData = item.extra;
			var mode = extraData? extraData.getInt("mode") : 0;
			var material = ToolAPI.getBlockMaterial(block.id) || {};
			material = material.name;
			if(mode > 1 && (material == "dirt" || material == "stone")){
				var side = coords.side;
				var X = 1;
				var Y = 1;
				var Z = 1;
				if(side==BlockSide.EAST || side==BlockSide.WEST){
				X = 0;}
				if(side==BlockSide.UP || side==BlockSide.DOWN){
				Y = 0;}
				if(side==BlockSide.NORTH || side==BlockSide.SOUTH){
				Z = 0;}
				for(var xx = coords.x - X; xx <= coords.x + X; xx++){
					for(var yy = coords.y - Y; yy <= coords.y + Y; yy++){
						for(var zz = coords.z - Z; zz <= coords.z + Z; zz++){
							var blockID = World.getBlockID(xx, yy, zz);
							var material = ToolAPI.getBlockMaterial(blockID) || {};
							if(material.name == "dirt" || material.name == "stone"){
								destroyTime = Math.max(destroyTime, Block.getDestroyTime(blockID) / material.multiplier / 24);
							}
						}
					}
				}
			}
			return destroyTime;
		}
		return params.base;
	},
	destroyBlock: function(coords, side, item, block){
		var mode = extraData? extraData.getInt("mode") : 0;
		if(mode >= 2 && item.data + 800 <= Item.getMaxDamage(item.id)){
			var X = 1;
			var Y = 1;
			var Z = 1;
			if(side==BlockSide.EAST || side==BlockSide.WEST){
			X = 0;}
			if(side==BlockSide.UP || side==BlockSide.DOWN){
			Y = 0;}
			if(side==BlockSide.NORTH || side==BlockSide.SOUTH){
			Z = 0;}
			for(var xx = coords.x - X; xx <= coords.x + X; xx++){
				for(var yy = coords.y - Y; yy <= coords.y + Y; yy++){
					for(var zz = coords.z - Z; zz <= coords.z + Z; zz++){
						blockID = World.getBlockID(xx, yy, zz);
						var material = ToolAPI.getBlockMaterial(blockID) || {};
						if(material.name == "dirt" || material.name == "stone"){
							item.data += 800;
							if(mode == 3 || material == "stone"){
								World.destroyBlock(xx, yy, zz, true);
							}else{
								drop = dirtBlocksDrop[blockID];
								if(drop){
									World.destroyBlock(xx, yy, zz, false);
									World.drop(xx+0.5, yy+0.5, zz+0.5, drop, 1);
								}
								else{World.destroyBlock(xx, yy, zz, true);}
							}
						}
						if(item.data + 800 >= Item.getMaxDamage(item.id)){
							Player.setCarriedItem(item.id, 1, item.data, extraData);
							return;
						}
					}
				}
			}
		}
		Player.setCarriedItem(item.id, 1, item.data, extraData);
	},
	useItem: function(coords, item, block){
		var side  = coords.side;
		coords = coords.relative;
		block = World.getBlockID(coords.x, coords.y, coords.z);
		if(GenerationUtils.isTransparentBlock(block)){
			for(var i = 9; i < 45; i++){
				var slot = Player.getInventorySlot(i);
				if(slot.id==50){
					slot.count--;
					if(!slot.count) slot.id = 0;
					Player.setInventorySlot(i, slot.id, slot.count, 0);
					World.setBlock(coords.x, coords.y, coords.z, 50, (6 - side)%6);
					break;
				}
			}
		}
	}
});

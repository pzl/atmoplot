/*(function(exports){

	function barb(){
		var speed_accessor = function(d){ return d[2]; },
			speed = 0;

		function run(d,i,nodes){
			speed = speed_accessor(d,i,nodes,0,360);
			return run;
		}

		run.draw = function(context, size) {
			var s = Math.sqrt(size)*2;
			console.log("drawing something of "+size)
			context.moveTo(-s/2,-s/2);
			context.lineTo(s/2,-s/2);
			context.lineTo(s/2,s/2);
			context.lineTo(-s/2,s/2);
			context.closePath();

			context.moveTo(-size/2,-size/2);
			context.lineTo(size/2,-size/2);
			context.lineTo(size/2,-size);
		}

		run.speed = function(s){
			speed_accessor = s;
			return run;
		}

		return run;
	}


	exports.symbolBarb = barb;
})(d3);
*/
	function barb(ctx,size,speed) {
		var calm_radius = size/8,
			flag_height = size/4,
			barb_length = size*2/5,
			barb_spacing = flag_height*2/3,
			halfbarb_ratio = 2/3;

			ctx.beginPath();

		if (speed < 5) {
			ctx.arc(0,0,calm_radius/3,0,2*Math.PI);
			ctx.fill();

			ctx.beginPath();
			ctx.arc(0,0,calm_radius,0,2*Math.PI);
			ctx.stroke();
		} else {
			var hemisphere = -1; //set to 1 for south
			var y=size;
			ctx.moveTo(0,y);
			while (speed >= 50) {
				ctx.beginPath();
				ctx.moveTo(0,y - flag_height);
				ctx.lineTo(0,y);
				ctx.lineTo(hemisphere*barb_length,y)
				ctx.closePath();
				ctx.fill();
				speed -= 50;
				y -= flag_height;
			}
			if (y != size ) y -= barb_spacing; // extra separation from last flag
			while ( speed >= 10 ) {
				ctx.beginPath();
				ctx.moveTo(0,y);
				ctx.lineTo(hemisphere*barb_length,y+flag_height);
				ctx.stroke();
				speed -= 10;
				y -= barb_spacing;
			}
			if ( speed >= 5 ) {
				if ( y == size ) y -= barb_spacing; // if half-stick comes first, it's offset from top
				ctx.beginPath();
				ctx.moveTo(0,y);
				ctx.lineTo(hemisphere*barb_length*halfbarb_ratio,y+flag_height*halfbarb_ratio);
				ctx.stroke();
			}

			// pole
			ctx.moveTo(0,0);
			ctx.lineTo(0,size);
			ctx.stroke();
		}
	}
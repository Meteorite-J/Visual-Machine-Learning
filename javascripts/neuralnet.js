var neuralnet = (function() {

  var NN = function(options) {
  };

  NN.prototype = {
	initialise: function() {		
		this.output = [];
		this.weight = [];
		this.bias = [];
		this.error = [];
		
		//initialise the node parameters
		for(var lyr=1; lyr < this.config.length; lyr++) {
			var nodes = this.config[lyr];
			this.output[lyr] = zeros(nodes);
			this.error[lyr] = zeros(nodes);
			
			this.weight[lyr] = [];
			this.bias[lyr] = [];
			for(var nd=0; nd < nodes; nd++) {
				//each node has weight for each output in prev layer and bias
				this.weight[lyr][nd] = randfs(this.config[lyr-1]);	
				this.bias[lyr][nd] = randf(0,1);			
			}
		}
	},
	
	forwardProp: function(input) {
		this.output[0] = input;
		for(var lyr=1; lyr < this.config.length; lyr++) {
			for (var node = 0; node < this.config[lyr]; node++) {
				var w = this.weight[lyr][node];
				var sum = dotProduct(w, this.output[lyr - 1]);
				sum += this.bias[lyr][node];
				this.output[lyr][node] = sigmoid(sum);
			}
		}
		return this.output[this.config.length-1];
	},
	
	backProp: function(target) {
		for(var lyr=this.config.length-1; lyr > 0; lyr--) {
			for (var node = 0; node < this.config[lyr]; node++) {
			var err = 0;
				if(lyr === this.config.length - 1) {
					//difference from target
					err = target[node] - this.output[lyr][node];
				} else {
					//get the errors from front layer
					for(var i = 0; i<this.config[lyr + 1]; i++) {
						//accumulate the errors from each node
						err += (this.error[lyr + 1][i] * this.weight[lyr + 1][i][node]);
					}
				}
				this.neterror.push(err);
				this.error[lyr][node] = err * this.output[lyr][node] * (1 - this.output[lyr][node]);
			}
		}
	},
	
	updateWeight: function() {
		for(var lyr=1; lyr < this.config.length; lyr++) {
			for (var node = 0; node < this.config[lyr]; node++) {
				//update weights
				for(var i = 0; i<this.config[lyr - 1]; i++) {
					this.weight[lyr][node][i] += this.learningRate * this.error[lyr][node] * this.output[lyr - 1][i];
				}
				this.bias[lyr][node] = this.learningRate * this.error[lyr][node];
			}
		}				
	},
	
	mse: function() {
		var sum = 0;
		for (var i=0;i<this.neterror.length;i++) {
			sum += (this.neterror[i] * this.neterror[i]);
		}
		return sum / this.neterror.length;
	},
	
	train: function(data, labels, options) {
		// parameters
		options = options || {};
		//layer configuration
		this.config = options.config || [2,5,5,1];
		// learning rate
		this.learningRate = options.learningRate || 0.1; 
		//initialise?
		var init = options.init || false;
		if(init) {
			this.initialise();
		}
		this.neterror = [];
		for(var i=0; i<data.length; i++) {
			this.forwardProp(data[i]);
			var target = [];
			target[0] = labels[i];
			this.backProp(target);
			this.updateWeight();
		}
		
		//return error
		return this.mse();
	},
	
	predict: function(instance) {
		return this.forwardProp(instance)[0] > 0.5 ? 1 : 0;
	}
  };
  
  function sigmoid(x) {
	return 1 / (1 + Math.exp(-x));
  }
  
  function dotProduct(w, x) {
    var s=0; 
    for(var q=0;q<x.length;q++) { s += w[q] * x[q]; } 
    return s;
  }

  // utility functions
  // generate random floating point number between a and b
  function randf(a, b) {
    return a + Math.random()*(b-a);
  }

  // generate random integer between a and b (b excluded)
  function randi(a, b) {
     return Math.floor(randf(a, b));
  }

  // create vector of zeros of length n
  function zeros(n) {
    var arr= [];
    for(var i=0;i<n;i++) { arr[i]= 0; }
    return arr;
  }
  
  // create vector of random numbers of length n
  function randfs(n) {
    var arr= [];
    for(var i=0;i<n;i++) { arr[i]= randf(0,1); }
    return arr;
  }
  
 //public members
  var pub = {};
  pub.NN = NN;
  return pub;
})();
angular.module('auletta.controllers', [])

.run(function($rootScope) {
    $rootScope.$on('handleLogout', function(event, args) {
        $rootScope.$broadcast('logoutBroadcast', args);
    });
    
    $rootScope.$on('handleLogin', function(event, args) {
        console.log("RootScope: handleLogin");
    	$rootScope.$broadcast('loginBroadcast', args);
    });
    
    $rootScope.$on('handleSignup', function(event, args) {
        console.log("RootScope: handleSignup");
    	$rootScope.$broadcast('signupBroadcast', args);
    });
})

.controller('AulettaCtrl', 
		function($scope, $ionicModal, $rootScope, $ionicHistory, $state, $ionicLoading)
		{
			$scope.helpers = AulettaGlobal.helpers;
			
			console.log($rootScope.loggedInStatus);
			
			$scope.user = {};
	
			var accountModalPageTitles = ["Login to your account", "Signup for an account"];
			
			$scope.accountModalPageMode = 0;
			$scope.accountModalPageTitle = accountModalPageTitles[$scope.accountModalPageMode];
			
			
			$ionicModal.fromTemplateUrl('templates/account-modal.html', 
					{
						scope: $scope,
						animation: 'slide-in-up',
						focusFirstInput: true,
						backdropClickToClose: false
					}
			).then(
					function(modal) {
						$scope.loginModal = modal;
					}
			);
			
			$scope.toggleLoginSignup = function()
			{
				$scope.accountModalPageMode = ($scope.accountModalPageMode==0) ? 1 : 0;
				$scope.accountModalPageTitle = accountModalPageTitles[$scope.accountModalPageMode];
			}
			
			$scope.$on('logoutBroadcast', function(event, args) {
		        $scope.helpers.logoutUser();
		        localStorage.removeItem("auletta_parse_id");
			    localStorage.removeItem("auletta_parse_st");			    
				args.childScope.isLoggedIn = $scope.helpers.isLoggedIn();
		    });     
			
			
			$scope.doLogin = function()
			{	
				$ionicLoading.show(
						{
							template: 'Logging you in...<br/><br/><i class="icon ion-loading-c"></i>',							
						    animation: 'fade-in',
						    showDelay: 0
						}
				);
				
				Parse.User.logIn($scope.user.email, $scope.user.password, {
					  success: function(user) {
					    localStorage.setItem("auletta_parse_id", user.id);
					    localStorage.setItem("auletta_parse_st", user._sessionToken);
					    
					    $scope.$emit('handleLogin', {childScope: $scope});
					    
					    $scope.loginModal.hide();
					    
					    $ionicLoading.hide();
					  },
					  error: function(user, error) {					    
					    alert("Sorry, but your login failed.");
					  }
					});
			}
			
			$scope.doSignup = function()
			{
				var user = new Parse.User();
				user.set("username", $scope.user.email);
				user.set("password", $scope.user.password);
				user.set("email", $scope.user.email);
				  
				// other fields can be set just like with Parse.Object
				user.set("fullname", $scope.user.name);
				  
				user.signUp(null, {
				  success: function(user) {
				    //alert("You are now signed up as " + $scope.user.email);
				    $scope.$emit('handleSignup', {childScope: $scope});
				    $scope.loginModal.hide();
				  },
				  error: function(user, error) {
				    // Show the error message somewhere and let the user try again.
				    alert("Error: " + error.code + " " + error.message);
				  }
				});
			}
			
			$scope.aulettaShowLoginModal = function()
			{
				  $scope.loginModal.show();
			}
			
			$scope.aulettaHideLoginModal = function()
			{
				  $scope.loginModal.hide();
			}
			
			$scope.$on('$destroy', 
					function() {
			    		$scope.loginModal.remove();
			  		}
			);
			
			$scope.loginStatus = $scope.helpers.isLoggedIn();
			
		}
)

.controller('HomeCtrl', 
		function($scope, $state, $ionicHistory)
		{
			
			$scope.homeNavigate = function(_destination)
			{
				$ionicHistory.nextViewOptions(
						{
							disableBack: true
						}
				);
				$state.go(_destination);
			}
	
		}
)

		

.controller('DecksCtrl', 
		function($scope, Decks, Global, $ionicActionSheet, $ionicModal, $timeout, $ionicSlideBoxDelegate, $ionicLoading, $interval, $ionicHistory, $state) 
		{
			
			
			$scope.decks = Decks.all();
			
			$scope.preventCloseTimout = '';
			
			$scope.showSearch = false;
			
			$scope.deckFilter = '';
			
			$scope.canClosePlayer = false;
			
			$scope.imageRandomNumber = 1;
			
			
			birdInterval = $interval(function(){$scope.imageRandomNumber = Math.floor(Math.random()*(3-1+1)+1)}, 4000);
			$scope.$on('$destroy', 
					function() {		          
		          		$interval.cancel(birdInterval);
		        	}
			);
			
			$ionicModal.fromTemplateUrl('templates/player-modal.html', 
					{
						scope: $scope,
						animation: 'slide-in-up',
						backdropClickToClose: false
					}
			).then(
					function(modal) {
						$scope.playerModal = modal;
					}
			);			
			
			$scope.toggleSearch = function()
			{
				$scope.showSearch = !$scope.showSearch;
			}
			
			$scope.toggleReorder = function()
			{
				$scope.shouldShowReorder = !$scope.shouldShowReorder;
			}
			
			$scope.toggleEdit = function()
			{
				$scope.shouldShowDelete = !$scope.shouldShowDelete;
			}
			
			$scope.reorderItem = function(_deck, _from, _to)
			{
				console.log("Move " + _deck.deckId + " from " + _from + " to " + _to);
				Decks.reorder(_deck.deckId, _from, _to);
				Decks.persist();
			}
			
			
			$scope.editDeck = function(_deckId)
			{
				$ionicHistory.nextViewOptions({disableBack: true});
				$state.go('tab.editDeck', {deckId: _deckId});
			}
			
			$scope.showPlayerModal = function(_deckId)
			{
				$scope.playingDeck = Decks.get(_deckId);
				$scope.currentCardIndex = -1;
				$scope.nextCard();				
				
				$ionicLoading.show(
						{
							template: 'Loading ' + $scope.playingDeck.deckTitle + '...<br/><br/><i class="icon ion-loading-c"></i>',							
						    animation: 'fade-in',
						    showDelay: 0
						}
				);
				
				
				
				$timeout( 
						function() 
						{
							$ionicSlideBoxDelegate.update();
						}, 
						50);
				
				$timeout( 
						function() 
						{
							$ionicLoading.hide();
							$scope.playingDeckReady = true;
							$scope.playerModal.show();
						}, 
						1500);
			}
			
			$scope.nextCard = function()
			{
				$scope.currentCardIndex = ($scope.currentCardIndex < $scope.playingDeck.deckCards.length-1) ? $scope.currentCardIndex + 1 : 0;
				$scope.currentPlayingCard = $scope.playingDeck.deckCards[$scope.currentCardIndex];				
			}
			
			$scope.prevCard = function()
			{
				$scope.currentCardIndex = ($scope.currentCardIndex > 0) ? $scope.currentCardIndex - 1 : $scope.playingDeck.deckCards.length-1;
				$scope.currentPlayingCard = $scope.playingDeck.deckCards[$scope.currentCardIndex];				
			}
			
			
			$scope.toggleCanClosePlayer = function()
			{
				$scope.canClosePlayer = !$scope.canClosePlayer;
			}
			
			$scope.activatePlayerClose = function()
			{
				$scope.toggleCanClosePlayer();
				$timeout($scope.toggleCanClosePlayer, 2000);
			}
			
			$scope.hidePlayerModal = function()
			{
				$scope.playerModal.hide();				
			}
			
			
			$scope.$on('$destroy', 
					function() {
			    		$scope.playerModal.remove();
			  		}
			);
			
			
			$scope.trashDeck = function(_deck)
			{	
				var hideSheet = $ionicActionSheet.show(
						{
							destructiveText: 'Delete',
							titleText: 'Are you sure you want to delete this deck?',
							cancelText: 'Cancel',
							cancel: function() 
							{
								$scope.toggleEdit();
							},
							buttonClicked: function(index) {
								return true;
							},
							destructiveButtonClicked: function() {
								$scope.decks = Decks.remove(_deck.deckId);
								Decks.persist();
								$scope.toggleEdit();
								return true;
							}	
						}
				);
			}
			
		}		
)


.controller('AddDeckCtrl', function($scope, $rootScope, $ionicPlatform, $cordovaMedia, $cordovaCapture, $ionicActionSheet, $ionicPopup, Decks, $cordovaCamera, $state, $ionicHistory, $cordovaFile, $interval, Cards, $stateParams) {
	
	
	
	$scope.helpers = AulettaGlobal.helpers;
	
	$scope.viewTitle = "Add New Deck";
	
	$scope.saveToGallery = false;
	
	$scope.savedCards = Cards.all();
	
	$scope.imageRandomNumber = Math.floor(Math.random()*(3-1+1)+1);
	birdInterval = $interval(function(){$scope.imageRandomNumber = Math.floor(Math.random()*(3-1+1)+1)}, 4000);
	$scope.$on('$destroy', 
			function() {		          
          		$interval.cancel(birdInterval);
        	}
	);
	
	$scope.selectedFromGallery = [];
	
	$scope.success = "";
	$scope.src = "";
	
	$scope.showPreview = false;
	$scope.togglePreview = function()
	{
		$scope.showPreview = !$scope.showPreview;
		if($scope.contentStep == 2)
		{
			$scope.contentStep = 0;
			$scope.viewTitle = "Preview Card";
		}
		else
		{
			$scope.contentStep = 2;
			$scope.viewTitle = "Add Cards";
		}
	}
	
	$scope.cardSelectionToggle = function(_cardId)
	{
		var _existsAt = $scope.selectedFromGallery.indexOf(_cardId);
		
		if(_existsAt < 0)
		{
			$scope.selectedFromGallery.push(_cardId);
		}
		else
		{
			$scope.selectedFromGallery.splice(_existsAt, 1);
		}
		
		console.log($scope.selectedFromGallery);
	}
	
	$scope.addCardsFromGallery = function()
	{
		if($scope.selectedFromGallery.length > 0)
		{
			for(var i = 0; i <= $scope.selectedFromGallery.length-1; i++) 
			{
				$scope.currentDeck.deckCards.push(Cards.get($scope.selectedFromGallery[i]));			    
			}
		}
		
		$scope.selectedFromGallery = [];
		$scope.gotoStep(4);
	}
	
	
	console.log($stateParams.deckId);
	if($stateParams.deckId)
	{
		$scope.currentDeck = Decks.get($stateParams.deckId);
		$scope.editingDeck = true;
	}
	else
	{
		$scope.editingDeck = false;
		$scope.currentDeck = 
		{
		 	deckId: $scope.helpers.generateGUID(),
			deckTitle: "",
		 	deckDescription: "",
		 	deckThumb: "",
		 	deckCards: []
		};
	}
	
	//Object to model a blank card
	blankCard();
	
	//Controls for displaying the right content based on step
	$scope.contentStep = 1;
	$scope.viewTitle = $scope.editingDeck ? "Edit Deck" : "Add New Deck";

	
	$ionicPlatform.ready(
			function() 
			{
				
				console.log("IonicPlatform Ready");
				$scope.success = "Platform Ready";
				
				//Load a sample sound
				$scope.src = $scope.helpers.getPhoneGapPath() + "sound_files/sample.mp3";
				/*
				$scope.media = new Media
							(
										$scope.src, 
										function()
										{
											console.log("playAudio():Audio Success");
										}, 
										function(error)
										{
											alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
										}
							);
				*/
												
			}
	);
	
	
	$scope.cancelAddDeck = function()
	{	
		var hideSheet = $ionicActionSheet.show(
				{
					destructiveText: 'Exit',
					titleText: 'Are you sure you want to exit?',
					cancelText: 'Cancel',
					cancel: function() 
					{
						
					},
					buttonClicked: function(index) {
						return true;
					},
					destructiveButtonClicked: function() {
						
						if($scope.editingDeck)
						{
							$scope.currentDeck = Decks.get($scope.currentDeck.deckId);
						}
						else
						{
							$scope.currentDeck = 
							{
							 	deckId: $scope.helpers.generateGUID(),
								deckTitle: "",
							 	deckDescription: "",
							 	deckThumb: "",
							 	deckCards: []
							};
						}
						
						$scope.gotoStep(1);
						
						$ionicHistory.nextViewOptions(
								{
									disableBack: true
								}
						);
						
						$state.go('tab.decks');
						
						return true;
					}	
				}
		);
	}
	
	//Process flow functions
	$scope.gotoStep = function(_stepId)
	{
		if(_stepId == 1)
		{
			$scope.viewTitle = $scope.editingDeck ? "Edit Deck" : "Add New Deck";
		}
		else if(_stepId == 2)
		{
			$scope.viewTitle = "Build a Card";
		}	
		else if(_stepId == 3)
		{
			$scope.currentDeck.deckThumb = $scope.currentDeck.deckCards[0].cardImage;
			$scope.viewTitle = "Review &amp; Save";
		}
		else if(_stepId == 0)
		{
			$scope.viewTitle = "Preview Card";
		}
		else if(_stepId == 4)
		{
			$scope.viewTitle = "Add Cards";
		}
		else if(_stepId == 5)
		{
			
		}
		
		$scope.contentStep = _stepId;
	}
	
	$scope.cardOptionsReveal = '';
	$scope.cardOptions = function(_cardId)
	{
		if(_cardId == $scope.cardOptionsReveal)
		{
			$scope.cardOptionsReveal = '';
		}
		else
		{
			$scope.cardOptionsReveal = _cardId;
		}
		
		
		console.log($scope.cardOptionsReveal);
	}
	
	$scope.deleteCard = function(_cardId)
	{
		var spliceAt = -1;
		
		for (var i = 0; i < $scope.currentDeck.deckCards.length; i++) 
		{
			if ($scope.currentDeck.deckCards[i].cardId === _cardId) {
				spliceAt = i;
			}
		}
		
		if(spliceAt > -1)
		{
			$scope.currentDeck.deckCards.splice(spliceAt, 1);
		}
	}
	
	$scope.editCard = function(_cardId)
	{
		var cardIndex = -1;
		
		console.log("Edit Card: " + _cardId);
		
		for (var i = 0; i < $scope.currentDeck.deckCards.length; i++) 
		{
			console.log($scope.currentDeck.deckCards[i].cardId);
			if ($scope.currentDeck.deckCards[i].cardId === _cardId) {
				cardIndex = i;
			}
		}
		
		$scope.currentCard = $scope.currentDeck.deckCards[cardIndex];		
		$scope.editingCard = true;
		$scope.gotoStep(2);
	}
	
	
	
	$scope.saveCard = function()
	{
		if($scope.editingCard)
		{
			
			var spliceAt = -1;
			
			for (var i = 0; i < $scope.currentDeck.deckCards.length; i++) 
			{
				if ($scope.currentDeck.deckCards[i].cardId === $scope.currentCard.cardId) {
					spliceAt = i;
				}
			}
			
			if(spliceAt > -1)
			{
				$scope.currentDeck.deckCards.splice(spliceAt, 1, $scope.currentCard);
			}
			
			
			if($scope.saveToGallery)
			{
				Cards.add($scope.currentCard);
				Cards.persist();			
			}
			
			$scope.editingCard = false;
			
			blankCard();
			$scope.gotoStep(3);
		}
		else
		{
			$scope.currentDeck.deckCards.push($scope.currentCard);
			if($scope.saveToGallery)
			{
				Cards.add($scope.currentCard);
				Cards.persist();			
			}
			blankCard();
			$scope.gotoStep(4);
		}
	}
	
	$scope.cancelBuildCard = function()
	{
		blankCard();
		if($scope.editingCard)
		{
			//TODO: Reset card in case edits where in progress
			$scope.editingCard = false;
			$scope.gotoStep(3);
		}
		else
		{			
			$scope.gotoStep(4);
		}		
	}
	
	$scope.toggleSaveToGallery = function()
	{
		$scope.saveToGallery = !$scope.saveToGallery;		
	}
	
	$scope.resetToBlankCard = function()
	{
		var actionSheet = $ionicActionSheet.show(
				{
					destructiveText: 'Reset',
					titleText: 'Are you sure you want to reset this card?',
					cancelText: 'Cancel',
					cancel: function() 
					{
						
					},
					destructiveButtonClicked: function() {
						blankCard();
						return true;
					}					
				}
		);
	}
	
	$scope.saveDeck = function()
	{
		if($scope.helpers.isLoggedIn() || true)
			{
				
				if($scope.editingDeck)
				{
					Decks.remove($scope.currentDeck.deckId);
				}
				
				Decks.add($scope.currentDeck);
				Decks.persist();
				
				console.log(Decks.all());
				
				$ionicHistory.nextViewOptions(
						{
							disableBack: true
						}
				);
				$state.go('tab.decks');
			}
		else
			{
				$scope.aulettaShowLoginModal();
			}
		
		
		$scope.gotoStep(1);
		
	}
	
	$scope.playAudio = function(_audioFile)
	{
		_audioFile = $scope.helpers.getPhoneGapPath() + "sound_files/sample.mp3";
		
		$scope.media = new Media
		(
					_audioFile, 
					function()
					{
						console.log("playAudio():Audio Success");
					}, 
					function(error)
					{
						alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
					}
		);
		$scope.media.play();
	}
	
	$scope.captureImage = function()
	{
		
		var actionSheet = $ionicActionSheet.show(
				{
					buttons: [
					          { text: 'Take Photo' },
					          { text: 'Choose Existing' }
					        ],
					titleText: 'Add an image to your card',
					cancelText: 'Cancel',
					cancel: function() 
					{
						
					},
					buttonClicked: function(index) 
					{
						if(index == 0)
						{
							//Capture new
							var options = 
							{
									destinationType: Camera.DestinationType.DATA_URL,
								    sourceType: Camera.PictureSourceType.CAMERA,
								    allowEdit: true,
								    encodingType: Camera.EncodingType.JPEG,
								    targetWidth: 640,
								    targetHeight: 960
							};

							$cordovaCamera.getPicture(options).then(
									function(imageData) 
									{
										$scope.currentCard.cardImage = "data:image/png;base64,"+imageData;								
									}, 
									function(err) 
									{
										// error
									}
							);
						}
						else if(index == 1)
						{
							//Existing photo
							var options = 
							{
									destinationType: Camera.DestinationType.DATA_URL,
								    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
							};

							$cordovaCamera.getPicture(options).then(
									function(imageData) 
									{
										$scope.currentCard.cardImage = "data:image/png;base64,"+imageData;								
									}, 
									function(err) 
									{
										// error
									}
							);
						}
						return true;
					}
									
				}
		);
	}
	
	$scope.toggleCardTextEntry = function()
	{
		$scope.enteringCardText = !$scope.enteringCardText;
		
		if($scope.currentCard.cardText == '[click to add text]')
		{
			$scope.currentCard.cardText = '';
		}
		else if($scope.currentCard.cardText == '')
		{
			$scope.currentCard.cardText = '[click to add text]';
		}
	}
	
	$scope.captureText = function()
	{	
		if($scope.currentCard.cardText == '[click to add text]')
		{
			$scope.currentCard.cardText = '';
		}
		
		var myPopup = $ionicPopup.show({
		    template: '<input type="text" ng-model="currentCard.cardText">',
		    title: 'Enter the text for this card',
		    scope: $scope,
		    buttons: [
		      { 
		    	  text: 'Cancel',
		    	  onTap: function(e) {		          
		    		  if($scope.currentCard.cardText == '')
		    		  {
		    			  $scope.currentCard.cardText = '[click to add text]';
		    		  }  
		    		  return $scope.currentCard.cardText;		          
			      }
		      },
		      {
		        text: '<b>Ok</b>',
		        type: 'button-positive',
		        onTap: function(e) {		          
		            return $scope.currentCard.cardText;		          
		        }
		      }
		    ]
		  });
	}
	
	$scope.captureAudio = function()
	{
		var options = { limit: 1, duration: 10 };
		
		$cordovaCapture.captureAudio(options).then(
	    		function(audioData) {
	    			// Success! Audio data is here
	    			
	    			var _path = audioData[0].fullPath.substring(0, audioData[0].fullPath.lastIndexOf("/")+1);
	    			var _file = audioData[0].name;	    			
	    			var _dest = $scope.helpers.getPhoneGapPath() + "sound_files/";
	    			
	    			alert("Attempting to move audio file: " + _path + _file + " --> " + _dest);
	    			    			
	    			var fileEntry = audioData[0].fullPath;
	    			
	    			//_audioFile = $scope.helpers.getPhoneGapPath() + "sound_files/sample.mp3";
	    			_audioFile = _path + _file;
	    			
	    			$scope.media = new Media
	    			(
	    						_audioFile, 
	    						function()
	    						{
	    							console.log("playAudio():Audio Success");
	    						}, 
	    						function(error)
	    						{
	    							alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
	    						}
	    			);
	    			
	    			$scope.media.play();
	    			
	    			
	    			//window.resolveLocalFileSystemURL
	    			//(
	    			//		cordova.file.dataDirectory, 
	    			//	      function(appFiles) {
	    			//	        	fileEntry.copyTo(
	    			//	        			appFiles, 
	    			//	        			"file3.jpg", 
	    			//	        			function(result){ alert("Success: " + result); }, 
	    			//	        			function(result){ alert("Error: " + result); }
	    			//	        	);
	    			//	      }, 
	    			//	      function(result){ alert("Error Out: " + result); }
	    			//	    );
	    			
	    			 
	    			$cordovaFile.copyFile(_path, _file, _dest)
	    		      .then(function (success) {
	    		    	  $scope.currentCard.cardAudio = _dest + _file;
	    		    	  alert("File moved: " + _path + _file + " --> " + _dest);
	    		      }, function (error) {
	    		        alert("Unable to move audio file: " + _path + _file + " --> " + _dest);
	    		      });
	    		    
	    		}, 
	    		function(err) {
	    			// An error occurred. Show a message to the user
	    			alert(err);
	    		}
	    );
	    
	}
	
	function blankCard()
	{
		$scope.currentCard = 
		{
			cardId: $scope.helpers.generateGUID(),
			cardImage: "img/add-image.png",
			cardText: "[click to add text]",
			cardAudio: ""
		}
	}
	
})

.controller('SettingsCtrl', function($scope, $rootScope, $ionicActionSheet, $interval, $ionicLoading, Global, $ionicPopup) {
	$scope.helpers = AulettaGlobal.helpers;
	
	$scope.childModePin = { value: "" };
	
	//Needs to be globalized
	$scope.childModeEnabled = $rootScope.childModeEnabled;
		
	$scope.imageRandomNumber = Math.floor(Math.random()*(3-1+1)+1);
	birdInterval = $interval(function(){$scope.imageRandomNumber = Math.floor(Math.random()*(3-1+1)+1)}, 4000);
	$scope.$on('$destroy', 
			function() {		          
          		$interval.cancel(birdInterval);
        	}
	);
	
	
	$scope.isLoggedIn = $scope.helpers.isLoggedIn();
		
	$scope.$on('loginBroadcast', function(event, args) {
        console.log("LoginBroadcast");
		$scope.isLoggedIn = true;
    });  
	
	$scope.$on('signupBroadcast', function(event, args) {
        console.log("SignupBroadcast");
		$scope.isLoggedIn = true;
    });  
	
	$scope.toggleChildMode = function()
	{
		var _message = $scope.childModeEnabled ? 'Turning Off Child Mode...<br/><br/><i class="icon ion-loading-c"></i>' : 'Turning On Child Mode...<br/><br/><i class="icon ion-loading-c"></i>' 
		
		if($scope.childModeEnabled)
		{
			
			var myPopup = $ionicPopup.show({
			    template: '<input type="password" ng-model="childModePin.value">',
			    title: 'Enter the PIN to exit Child Mode',
			    scope: $scope,
			    buttons: [
			      { 
			    	  text: 'Cancel',
			    	  onTap: function(e) {
			    		  return;		          
				      }
			      },
			      {
			        text: '<b>Ok</b>',
			        type: 'button-positive',
			        onTap: function(e) {		          
			            console.log($scope.childModePin.value);
			        	
			        	if($scope.childModePin.value == "8888")
			            {
			            	$ionicLoading.show(
			        				{
			        					template: _message,							
			        				    animation: 'fade-in',
			        				    showDelay: 0,
			        				    duration: 1500
			        				}
			        		);
			            	
			            	$rootScope.childModeEnabled = false;
			            	$scope.childModeEnabled = false;
			            }	          
			        }
			      }
			    ]
			  });
			
			
		}
		else
		{
			$ionicLoading.show(
					{
						template: _message,							
					    animation: 'fade-in',
					    showDelay: 0,
					    duration: 1500
					}
			);
			$rootScope.childModeEnabled = true;
			$scope.childModeEnabled = true;
		}		
		
	}
	
	$scope.broadcastLogout = function()
							{
		 						
								var hideSheet = $ionicActionSheet.show(
										{
											destructiveText: 'Logout',
											titleText: 'Are you sure you want to logout?',
											cancelText: 'Cancel',
											cancel: function() 
											{
												
											},
											buttonClicked: function(index) {
												return true;
											},
											destructiveButtonClicked: function() {
												$scope.$emit('handleLogout', {childScope: $scope});
												return true;
											}	
										}
								);
							}
	
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
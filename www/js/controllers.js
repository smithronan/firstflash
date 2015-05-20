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
			
			$scope.helpers = AulettaGlobal.helpers;
			
			var _pEventDimensions = { screen: 'home' };			
			$scope.helpers.trackEvent('screenview', _pEventDimensions);
			
	
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
		function($scope, Decks, Global, $ionicActionSheet, $ionicModal, $timeout, $ionicSlideBoxDelegate, $ionicLoading, $interval, $ionicHistory, $state, $cordovaMedia) 
		{
			
			$scope.helpers = AulettaGlobal.helpers;
			
			var _pEventDimensions = { screen: 'My Decks' };			
			$scope.helpers.trackEvent('screenview', _pEventDimensions);
			
			$scope.showEditCardArray = [];
			$scope.toggleEditCardArray = function(_index)
			{
				if($scope.showEditCardArray[_index] == true)
				{
					$scope.showEditCardArray = [];					
				}
				else
				{
					$scope.showEditCardArray = [];
					$scope.showEditCardArray[_index] = true;
				}
			}
						
			$scope.decks = Decks.all();
			
			$scope.preventCloseTimout = '';
			
			$scope.showSearch = false;
			
			$scope.deckFilter = '';
			
			$scope.canClosePlayer = false;
			
			$scope.imageRandomNumber = 1;
			
			$scope.onHold = function()
			{
				alert('Hold');
			}
						
			//birdInterval = $interval(function(){$scope.imageRandomNumber = Math.floor(Math.random()*(3-1+1)+1)}, 4000);
			//$scope.$on('$destroy', 
			//		function() {		          
		    //      		$interval.cancel(birdInterval);
		    //    	}
			//);
			
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
			
			$scope.playAudio = function(_audioFile)
			{
				
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
				var _pEventDimensions = { screen: 'Player' };			
				$scope.helpers.trackEvent('screenview', _pEventDimensions);
				
				var _pEventDimensions = { deckId: _deckId };			
				$scope.helpers.trackEvent('play-deck', _pEventDimensions);
				
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
							$scope.currentPlayingCard = $scope.playingDeck.deckCards[0];
							$timeout( 
									function() 
									{
										$scope.playAudio($scope.currentPlayingCard.cardAudio);
									}, 
									500);
							
						}, 
						1500);
			}
			
			$scope.playerSlideChanged = function(_index)
			{
				$scope.currentPlayingCard = $scope.playingDeck.deckCards[_index];
				
				$timeout( 
						function() 
						{
							$scope.playAudio($scope.currentPlayingCard.cardAudio);
						}, 
						500);
				
				var _pEventDimensions = { };			
				$scope.helpers.trackEvent('deck-scroll', _pEventDimensions);
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
				$timeout( 
						function() 
						{
							$scope.playAudio($scope.currentPlayingCard.cardAudio);
						}, 
						1000);
			}
			
			
			$scope.toggleCanClosePlayer = function()
			{
				$scope.canClosePlayer = !$scope.canClosePlayer;
			}
			
			$scope.activatePlayerClose = function()
			{
				$scope.toggleCanClosePlayer();
				$timeout($scope.toggleCanClosePlayer, 2000);
				
				var _pEventDimensions = { };			
				$scope.helpers.trackEvent('player-close-intent', _pEventDimensions);
			}
			
			$scope.hidePlayerModal = function()
			{
				$scope.playerModal.hide();
				
				var _pEventDimensions = {  };			
				$scope.helpers.trackEvent('player-close', _pEventDimensions);
			}
			
			
			$scope.$on('$destroy', 
					function() {
			    		$scope.playerModal.remove();
			  		}
			);
			
			
			$scope.trashDeck = function(_deck)
			{	
				var _pEventDimensions = { };			
				$scope.helpers.trackEvent('deck-delete-intent', _pEventDimensions);
				
				var hideSheet = $ionicActionSheet.show(
						{
							destructiveText: 'Delete',
							titleText: 'Are you sure you want to delete this deck?',
							cancelText: 'Cancel',
							cancel: function() 
							{
								$scope.toggleEdit();
								var _pEventDimensions = { };			
								$scope.helpers.trackEvent('deck-delete-cancel', _pEventDimensions);
							},
							buttonClicked: function(index) {
								return true;
							},
							destructiveButtonClicked: function() {
								$scope.decks = Decks.remove(_deck.deckId);
								Decks.persist();
								$scope.toggleEdit();
								var _pEventDimensions = { };			
								$scope.helpers.trackEvent('deck-delete-confirm', _pEventDimensions);
								return true;
							}	
						}
				);
			}
			
		}		
)


.controller('AddDeckCtrl', function($scope, $rootScope, $ionicPlatform, $ionicLoading, $cordovaMedia, $cordovaCapture, $ionicActionSheet, $ionicPopup, Decks, $cordovaCamera, $state, $ionicHistory, $cordovaFile, $interval, Cards, $stateParams, $ionicListDelegate) {
	
	
	
	$scope.helpers = AulettaGlobal.helpers;
	
	var _pEventDimensions = { screen: 'Add Deck Home' };			
	$scope.helpers.trackEvent('screenview', _pEventDimensions);
	
	$scope.viewTitle = "Add New Deck";
	
	$scope.saveToGallery = false;
	
	$scope.savedCards = Cards.all();
	
	$scope.areReordering = false;
	
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
	
	$scope.toggleReviewSaveReorder = function()
	{
		$scope.areReordering = !$scope.areReordering;
	}
	
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
	$scope.contentStep = -1;
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
						
						$scope.gotoStep(-1);
						
						$ionicHistory.nextViewOptions(
								{
									disableBack: true
								}
						);
						
						//$state.go('tab.decks');
						
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
			var _pEventDimensions = { screen: 'Add Deck Intro' };			
			$scope.helpers.trackEvent('screenview', _pEventDimensions);
			
			$scope.viewTitle = $scope.editingDeck ? "Edit Deck" : "Create Deck";
		}
		else if(_stepId == 2)
		{
			var _pEventDimensions = { screen: 'Add Deck Build Card' };			
			$scope.helpers.trackEvent('screenview', _pEventDimensions);
			
			$scope.viewTitle = "Build a Card";
		}	
		else if(_stepId == 3)
		{
			var _pEventDimensions = { screen: 'Add Deck Save and Review' };			
			$scope.helpers.trackEvent('screenview', _pEventDimensions);
			
			$scope.currentDeck.deckThumb = $scope.currentDeck.deckCards[0].cardImage;
			$scope.viewTitle = "Save Deck";
		}
		else if(_stepId == 0)
		{
			var _pEventDimensions = { screen: 'Add Deck Preview Card' };			
			$scope.helpers.trackEvent('screenview', _pEventDimensions);
			
			$scope.viewTitle = "Preview Card";
		}
		else if(_stepId == 4)
		{
			var _pEventDimensions = { screen: 'Add Deck Add Cards' };			
			$scope.helpers.trackEvent('screenview', _pEventDimensions);
			
			$scope.viewTitle = "Add Cards";
		}
		else if(_stepId == 5)
		{
			var _pEventDimensions = { screen: 'Add Deck Choose Saved Card' };			
			$scope.helpers.trackEvent('screenview', _pEventDimensions);
		}
		else if(_stepId == 6)
		{
			var _pEventDimensions = { screen: 'Add Deck Browse Gallery' };			
			$scope.helpers.trackEvent('screenview', _pEventDimensions);
			
			$scope.viewTitle = "Deck Gallery";
			
			$scope.deckGallery = [];
			
			$scope.showDecks(0);
		}
		
		
		$scope.contentStep = _stepId;
	}
	
	
	$scope.showDecks = function(_type)
	{
		var _message = 'Loading Deck Gallery...<br/><br/><i class="icon ion-loading-c"></i>'
		
		$ionicLoading.show(
    		{
    			template: _message,							
    			animation: 'fade-in',
    			showDelay: 0,
    			duration: 1500
    		}
		);
		
		Parse.Cloud.run('getBrowsableDecks', {"type": _type}, {
			  success: function(result) 
			  {
				  $scope.deckGallery = result;
				  $ionicLoading.hide();
			  },
			  error: function(error) 
			  {
				  $ionicLoading.hide();
			  }
			});			
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
		
		var hideSheet = $ionicActionSheet.show(
				{
					destructiveText: 'Delete',
					titleText: 'Are you sure you want to delete this card?',
					cancelText: 'Cancel',
					cancel: function() 
					{
						
					},
					buttonClicked: function(index) {
						return true;
					},
					destructiveButtonClicked: function() {
						
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
						
						$ionicListDelegate.closeOptionButtons();
						
						return true;
					}	
				}
		);
				
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
		
		$ionicListDelegate.closeOptionButtons();
		
		$scope.currentCard = $scope.currentDeck.deckCards[cardIndex];		
		$scope.editingCard = true;
		$scope.gotoStep(2);
	}
	
	
	$scope.reorderCards = function(_card, _from, _to)
	{
		var cardToMove = $scope.currentDeck.deckCards[_from];
		$scope.currentDeck.deckCards.splice(_from, 1);
		$scope.currentDeck.deckCards.splice(_to, 0, cardToMove);
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
			var _pEventDimensions = { };			
			$scope.helpers.trackEvent('cancel-edit-card', _pEventDimensions);
			
			//TODO: Reset card in case edits where in progress
			$scope.editingCard = false;
			$scope.gotoStep(3);
		}
		else
		{
			var _pEventDimensions = { };			
			$scope.helpers.trackEvent('cancel-build-card', _pEventDimensions);
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
		var _pEventDimensions = { };			
		$scope.helpers.trackEvent('save-deck-intent', _pEventDimensions);
		
		if($scope.helpers.isLoggedIn())
			{
				
				if($scope.editingDeck)
				{
					Decks.remove($scope.currentDeck.deckId);
				}
				
				Decks.add($scope.currentDeck);
				Decks.persist();
				
				$scope.helpers.trackEvent('save-deck', _pEventDimensions);
				
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
				$scope.helpers.trackEvent('save-deck-login-prompt', _pEventDimensions);
				$scope.aulettaShowLoginModal();
			}
		
		
		$scope.gotoStep(1);
		
	}
	
	$scope.playAudio = function(_audioFile)
	{
		//_audioFile = $scope.helpers.getPhoneGapPath() + "sound_files/sample.mp3";
		
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
		var _pEventDimensions = { };			
		$scope.helpers.trackEvent('capture-image-intent', _pEventDimensions);
		
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
										var _pEventDimensions = { type: 'Take Photo'};			
										$scope.helpers.trackEvent('capture-image-success', _pEventDimensions);
										
										$scope.currentCard.cardImage = "data:image/png;base64,"+imageData;								
									}, 
									function(err) 
									{
										var _pEventDimensions = { type: 'Take Photo'};			
										$scope.helpers.trackEvent('capture-image-error', _pEventDimensions);
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
										var _pEventDimensions = { type: 'Choose Existing'};			
										$scope.helpers.trackEvent('capture-image-success', _pEventDimensions);
										
										$scope.currentCard.cardImage = "data:image/png;base64,"+imageData;								
									}, 
									function(err) 
									{
										var _pEventDimensions = { type: 'Choose Existing'};			
										$scope.helpers.trackEvent('capture-image-error', _pEventDimensions);
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
	    			
	    			//alert("Attempting to move audio file: " + _path + _file + " --> " + _dest);
	    			
	    			window.resolveLocalFileSystemURI(audioData[0].fullPath,
	    				    function (fileEntry) {
	    				        
	    						function getAudioAsBase64(file) 
	    						{
	    				            var reader = new FileReader();
	    				            
	    				            reader.onloadend = 	function (evt) 
	    				            					{
	    				                					var obj = evt.target.result;
	    				                					//TODO: Do something here with the Base64 data of the audio recording!
	    				            					};
	    				            
	    				            //reader.readAsDataURL(file);
	    				        };
	    				        
	    				        var failedToGetAudioFile = function (evt) 
	    				        {
	    				        	
	    				        };
	    				        
	    				        fileEntry.file(getAudioAsBase64, failedToGetAudioFile);
	    				        
	    				        $scope.currentCard.cardAudio = fileEntry.toURL();
	    				        
	    				        var _pEventDimensions = { };			
								$scope.helpers.trackEvent('capture-audio-success', _pEventDimensions);
	    				    },	    				    
	    				    function () { }
	    				);
	    		    
	    		}, 
	    		function(err) 
	    		{
	    			// An error occurred. Show a message to the user
	    			var _pEventDimensions = { error: err};			
					$scope.helpers.trackEvent('capture-audio-error', _pEventDimensions);	    			
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
	
	var _pEventDimensions = { screen: 'settings' };			
	$scope.helpers.trackEvent('screenview', _pEventDimensions);

	
	$scope.childModePin = { value: "" };
	
	//Needs to be globalized
	$scope.childModeEnabled = $rootScope.childModeEnabled;
		
	
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
			            	
			            	var _pEventDimensions = { };			
							$scope.helpers.trackEvent('child-mode-disabled', _pEventDimensions);
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
			
			var _pEventDimensions = { };			
			$scope.helpers.trackEvent('child-mode-enabled', _pEventDimensions);
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
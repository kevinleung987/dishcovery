$(document).ready(function(){

    $('.sidenav').sidenav();
    $('.materialboxed').materialbox();
    $('.parallax').parallax();
    $('.tabs').tabs();
    $('.datepicker').datepicker({
        disableWeekends: true,
        yearRange: 1
    });
    $('.tooltipped').tooltip();
    $('.scrollspy').scrollSpy();

});

// start carrousel
$('.carousel.carousel-slider').carousel({
    fullWidth: true,
    indicators: false
});


// move next carousel
$('.moveNextCarousel').click(function(e){
    e.preventDefault();
    e.stopPropagation();
    $('.carousel').carousel('next');
});

// move prev carousel
$('.movePrevCarousel').click(function(e){
    e.preventDefault();
    e.stopPropagation();
    $('.carousel').carousel('prev');
});
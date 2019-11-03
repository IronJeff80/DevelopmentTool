/**
 * Created by Jean on 2019-10-09.
 */

var Menu = {};

Menu.refreshMenu = function ()
{
    $.each(categories, function (key, value)
    {
        $(`.menu-hidden[data-type=${value}]`).children('p.collectible').remove();

        markers.filter(function(item)
        {
            if(item.day == 1 && item.icon == value)
            {
                $(`.menu-hidden[data-type=${value}]`).append(`<p class="collectible" data-type="${item.text}">${languageData[item.text+'.name']}</p>`);
            }
        });
    });

};


Menu.refreshItemsCounter = function()
{

};


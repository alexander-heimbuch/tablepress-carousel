
(function ($) {
    if (window.TABLE_CAROUSEL === undefined) {
        return;
    }

    var repositionNavigation = function ($element, $wrapper, initial, offset) {
            var wrapperOffsetTop = $wrapper.offset().top,
                scrollOffsetTop = $('body').scrollTop(),
                relativeOffset = scrollOffsetTop - wrapperOffsetTop + offset;

            if (scrollOffsetTop > wrapperOffsetTop + $wrapper.height() - $element.height()) {
                return;
            }

            if (relativeOffset < 0) {
                $element.css('top', initial);
                $element.removeClass('moving');
            } else {
                $element.addClass('moving');
                $element.css('top', relativeOffset);
            }
        },

        calcColumnWidth = function ($columns, ignoreCol) {
            var columnWidth = 0;

            ignoreCol = ignoreCol || 0;

            $columns.every(function (columnIndex) {
                var colWidth;

                // attributes col should not be the base of column width calculation
                if (ignoreCol > 0 && (columnIndex + 1) === ignoreCol) {
                    return;
                }

                colWidth = $(this.nodes()[0]).width();

                if (colWidth > columnWidth) {
                    columnWidth = colWidth;
                }
            });

            return columnWidth;
        },

        setColumnWidth = function ($columns, width, ignoreCol) {
            ignoreCol = ignoreCol || 0;

            $columns.each(function (columnIndex, node) {
                // attributes col should not be the base of column width calculation
                if (ignoreCol > 0 && (columnIndex + 1) === ignoreCol) {
                    return;
                }

                $(node).width(width);
            });
        },

        nextCol = function ($tableNode, $dataTable, columnsInViewport) {
            var hideColIndex;

            $tableNode.find('thead').each(function () {
                var $toHide,
                    $tableHeaders = $(this).find('th')
                    .not('.carousel-hidden')
                    .not('.carousel-attributes')
                    .not('.carousel-sticky');

                if ($tableHeaders.length <= columnsInViewport) {
                    return;
                }

                $toHide = $tableHeaders.first();

                $toHide.outerWidth(0).addClass('carousel-hidden');
                hideColIndex = $toHide.index();
            });

            if (hideColIndex === undefined) {
                return;
            }

            $dataTable.columns(hideColIndex).every(function () {
                $(this.nodes()).addClass('carousel-hidden');
            });
        },

        prevCol = function ($tableNode, $dataTable, columnWidth) {
            var showColIndex;

            $tableNode.find('thead').each(function () {
                var $toShow = $(this).find('th.carousel-hidden').last();

                $toShow.width(columnWidth).removeClass('carousel-hidden');
                showColIndex = $toShow.index();
            });

            $dataTable.columns(showColIndex).every(function () {
                $(this.nodes()).removeClass('carousel-hidden');
            });
        },

        drawCarousel = function ($tableNode, carousel) {
            var $frame = $($tableNode.parent()),
                frameWidth = $frame.width(),
                $dataTable = $tableNode.DataTable(),
                $columns = $dataTable.columns(),

                contentColumnWidth = calcColumnWidth($columns, carousel['attributes-col']),
                $attributesCol,
                attributesColumnWidth = 0,

                columnsInViewport = (frameWidth / contentColumnWidth) >> 0,

                $next = $('<a href="javascript:" class="carousel-icon carousel-right"><span>&#10097;</span></a>'),
                $prev = $('<a href="javascript:" class="carousel-icon carousel-left"><span>&#10097;</span></a>');

            // fallbacks
            carousel['sticky-cols'] = carousel['sticky-cols'] || [];

            if (columnsInViewport <= 1) {
                carousel['attributes-col'] = 0;
            }

            if (carousel['attributes-col'] > 0) {
                $attributesCol = $tableNode.find('th:eq(' + (carousel['attributes-col'] - 1) + ')');
                $attributesCol.addClass('carousel-attributes');
                attributesColumnWidth = calcColumnWidth($dataTable.columns(carousel['attributes-col'] - 1));
                setColumnWidth($attributesCol, contentColumnWidth, carousel['attributes-col']);
            }

            // equalize columns
            contentColumnWidth = (frameWidth - attributesColumnWidth) / columnsInViewport;

            // set the column width for every content column
            setColumnWidth($tableNode.find('th'), contentColumnWidth, carousel['attributes-col']);

            // set sticky cols
            if (columnsInViewport > 1) {
                carousel['sticky-cols'].forEach(function (colIndex) {
                    $tableNode.find('th:eq(' + (colIndex - 1) + ')').addClass('carousel-sticky');
                });
            }

            // button interactions
            $prev.on('click', function () {
                nextCol($tableNode, $dataTable, columnsInViewport);
            });

            $next.on('click', function () {
                prevCol($tableNode, $dataTable, contentColumnWidth);
            });

            $frame
                .addClass('table-carousle-frame')
                .append($prev)
                .append($next);

            $tableNode.addClass('table-carousel');

            // reposition navigation
            $(window).on('scroll', function () {
                repositionNavigation($next, $frame, 25, 50);
                repositionNavigation($prev, $frame, 25, 50);
            });
    };

    $.each(window.TABLE_CAROUSEL, function (tableId, carousel) {
        var $table = $('#' + tableId);

        $table.on( 'draw.dt', function () {
            drawCarousel($table, carousel);
        });
    });
})(jQuery);

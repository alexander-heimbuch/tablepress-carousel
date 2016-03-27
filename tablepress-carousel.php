<?php
/**
 * WordPress plugin "TablePress Carousel" main file, responsible for initiating the plugin
 *
 * @package TablePress Plugins
 * @author Alexander Heimbuch
 * @version 0.1
 */

/*
Plugin Name: TablePress Extension: Carousel
Plugin URI: http://aktivstoff.de/
Description: Extend TablePress tables with the ability to navigate through a table with a carousel
Version: 0.1
Author: Alexander Heimbuch
Author URI: http://aktivstoff.de
Author email: kontakt@aktivstoff.de
Text Domain: tablepress
Domain Path: /i18n
License: GPL 2
*/

// Prohibit direct script loading.
defined( 'ABSPATH' ) || die( 'No direct script access allowed!' );

add_action( 'tablepress_run', array( 'TablePress_Carousel', 'init' ) );

class TablePress_Carousel {

    protected static $slug = 'tablepress-carousel';
    protected static $version = '0.1';

    public static function init() {
        add_filter( 'tablepress_shortcode_table_default_shortcode_atts', array( __CLASS__, 'shortcode_table_default_shortcode_atts' ) );
        add_filter( 'tablepress_table_render_options', array( __CLASS__, 'table_render_options' ), 10, 2 );
        add_filter( 'tablepress_table_js_options', array( __CLASS__, 'table_js_options' ), 10, 3 );
        add_filter( 'tablepress_datatables_parameters', array( __CLASS__, 'datatables_parameters' ), 10, 4 );
        add_filter( 'tablepress_table_output', array( __CLASS__, 'table_output' ), 10, 5 );
    }

    public static function shortcode_table_default_shortcode_atts( $default_atts ) {
        $default_atts['carousel'] = '';
        $default_atts['carousel-sticky-cols'] = '';
        $default_atts['carousel-attributes-col'] = '';

        return $default_atts;
    }

    public static function table_render_options( $render_options, $table ) {
        if ( strlen( $render_options['carousel'] ) === 0 ) {
            $render_options['carousel'] = null;
            return $render_options;
        }

        $render_options['use_datatables'] = true;
        $render_options['carousel'] = true;

        if ( strlen( $render_options['carousel-sticky-cols'] ) > 0 ) {
            $render_options['carousel-sticky-cols'] = str_replace( ' ', '', $render_options['carousel-sticky-cols'] );
            $render_options['carousel-sticky-cols'] = split( ',', $render_options['carousel-sticky-cols'] );
        } else {
            $render_options['carousel-sticky-cols'] = 0;
        }

        if ( strlen( $render_options['carousel-attributes-col'] ) > 0 ) {
            $render_options['carousel-attributes-col'] = intval( $render_options['carousel-attributes-col'] );
        } else {
            $render_options['carousel-attributes-col'] = 0;
        }

        return $render_options;
    }

    public static function table_js_options( $js_options, $table_id, $render_options ) {
        if( $render_options['carousel'] !== null) {
            $js_options['carousel'] = true;
            wp_enqueue_script( self::$slug, plugins_url( 'tablepress-carousel.js', __FILE__ ), array( 'tablepress-datatables' ), self::$version, true );
            wp_enqueue_style( self::$slug, plugins_url( 'tablepress-carousel.css', __FILE__ ));
        }

        return $js_options;
    }

    public static function datatables_parameters( $parameters, $table_id, $html_id, $js_options ) {
        // DataTables Responsive Collapse/Row Details mode.
        $parameters['scrollX'] = '"scrollX":false';
        return $parameters;
    }

    public static function table_output( $output, $table, $render_options ) {
        if( !$render_options['carousel'] ) {
            return $output;
        }

        $options = array();
        $options['sticky-cols'] = $render_options['carousel-sticky-cols'];
        $options['attributes-col'] = $render_options['carousel-attributes-col'];

        return $output . '<script>
            if (window.TABLE_CAROUSEL === undefined) {
                window.TABLE_CAROUSEL = {};
            }

            window.TABLE_CAROUSEL["' . $render_options['html_id'] . '"] = JSON.parse(\'' . json_encode( $options ) . '\');
        </script>';
    }
}
?>

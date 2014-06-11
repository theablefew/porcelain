# lib/porcelain/view_helpers.rb
module Porcelain
  # View helper to render Porcelain charts.
  module ViewHelpers
    def render_porcelain_chart(chart_type, capabilities)
      "<div class='porcelain-chartable' data-chart-type='#{chart_type}' data-capabilities='#{capabilities}'></div>".html_safe
    end
  end
end

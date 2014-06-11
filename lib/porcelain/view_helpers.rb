# lib/porcelain/view_helpers.rb
module Porcelain
  # View helper to render Porcelain charts.
  module ViewHelpers
    def render_porcelain_chart(chart_type, capabilities)
      content_tag(:div, '', class: 'porcelain-chartable', data: { capabilities: capabilities, chart_type: chart_type })
    end
  end
end

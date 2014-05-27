module Porcelain
  module ViewHelpers
    def render_porcelain_chart(chart_type,capabilities)
      content_tag(:div, 
                  "", 
                  :class => "porcelain-chartable", 
                  :data => {:capabilities => capabilities,
                    :chart_type => chart_type
                  }
                 )    
    end
  end
end
